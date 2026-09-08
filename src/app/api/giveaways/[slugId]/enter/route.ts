import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import { Types } from "mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { checkEntryRateLimit } from "@/lib/ratelimit";
import { normalizePhone } from "@/lib/utils";

const entrySchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[\p{L}\s'-]+$/u, 'Name contains invalid characters'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long'),
  youtubeUsername: z
    .string()
    .min(1, 'YouTube username is required')
    .max(100, 'YouTube username is too long')
    .regex(/^@?[\w.-]+$/, 'Invalid YouTube username format'),
});

// Short-lived in-memory cache to reduce read pressure on MongoDB during 10k spikes
const giveawayMetaCache = new Map<
  string,
  {
    _id: Types.ObjectId;
    status: string;
    maxParticipants?: number;
    participantCount: number;
    cachedAt: number;
  }
>();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    // 1. Parse and validate body FIRST (Reject malformed requests with 0 DB/Redis cost)
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const validation = entrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { fullName, phone, youtubeUsername } = validation.data;

    // 2. Normalize and validate phone number before any remote I/O
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a valid Sri Lankan or international number.' },
        { status: 422 }
      );
    }

    // 3. Resilient Rate limiting (Upstash Redis + in-memory fallback for high spikes)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const { success, limit, remaining, reset } = await checkEntryRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const { slugId } = await params;
    if (!slugId || typeof slugId !== 'string') {
      return NextResponse.json({ error: 'Invalid giveaway slug' }, { status: 400 });
    }

    await connectDB();

    // 4. Verify giveaway exists and is ACTIVE (with 5-second in-memory cache)
    const now = Date.now();
    let meta = giveawayMetaCache.get(slugId);

    if (!meta || now - meta.cachedAt > 5000) {
      const giveaway = await Giveaway.findOne(
        { slugId },
        { _id: 1, status: 1, maxParticipants: 1, participantCount: 1 }
      ).lean();

      if (!giveaway) {
        return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
      }

      meta = {
        _id: giveaway._id as Types.ObjectId,
        status: giveaway.status,
        maxParticipants: giveaway.maxParticipants,
        participantCount: giveaway.participantCount ?? 0,
        cachedAt: now,
      };
      giveawayMetaCache.set(slugId, meta);
    }

    if (meta.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This giveaway is not currently accepting entries.' },
        { status: 403 }
      );
    }

    // 5. Check participant cap (O(1) counter lookup instead of slow countDocuments query)
    if (meta.maxParticipants && meta.participantCount >= meta.maxParticipants) {
      return NextResponse.json(
        { error: 'This giveaway has reached its maximum number of participants.' },
        { status: 403 }
      );
    }

    // 6. Normalize YouTube username (strip leading @)
    const cleanYoutubeUsername = youtubeUsername.startsWith('@')
      ? youtubeUsername.slice(1)
      : youtubeUsername;

    // 7. Create participant (Compound unique indexes guarantee no duplicates at DB level)
    const participant = (await Participant.create({
      giveawayId: meta._id,
      fullName: fullName.trim(),
      phone: normalizedPhone,
      youtubeUsername: cleanYoutubeUsername.toLowerCase(),
    })) as { _id: Types.ObjectId };

    // 8. Atomically increment participant counter on Giveaway
    await Giveaway.updateOne(
      { _id: meta._id },
      { $inc: { participantCount: 1 } }
    );
    meta.participantCount += 1;

    return NextResponse.json(
      { success: true, participantId: participant._id.toString() },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Handle MongoDB duplicate key error (compound unique index violation)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      const keyPattern = (error as { keyPattern?: Record<string, number> }).keyPattern || {};
      if ('phone' in keyPattern) {
        return NextResponse.json(
          { error: 'This phone number has already been used to enter this giveaway.' },
          { status: 409 }
        );
      }
      if ('youtubeUsername' in keyPattern) {
        return NextResponse.json(
          { error: 'This YouTube username has already been used to enter this giveaway.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'You have already entered this giveaway.' },
        { status: 409 }
      );
    }

    console.error('[POST /api/giveaways/[slugId]/enter]', error);
    return NextResponse.json({ error: 'Failed to submit entry. Please try again.' }, { status: 500 });
  }
}
