import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/utils";

const createGiveawaySchema = z.object({
  slugId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Slug can only contain letters, numbers, hyphens, and underscores'),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  youtubeUrl: z.string().url(),
  maxParticipants: z.number().int().positive().optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).default('UPCOMING'),
  startDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : undefined),
  timeZone: z.string().optional().default('Asia/Colombo'),
  prizeDescription: z.string().max(500).optional(),
  approximateRetailValue: z.string().max(100).optional(),
  eligibilityCriteria: z.string().max(500).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const giveaways = await Giveaway.find({}).sort({ createdAt: -1 }).lean();

    // Get participant counts for all giveaways (fallback if not stored)
    const counts = await Promise.all(
      giveaways.map((g) =>
        typeof g.participantCount === "number"
          ? Promise.resolve(g.participantCount)
          : Participant.countDocuments({ giveawayId: g._id })
      )
    );

    const result = giveaways.map((g, i) => ({
      ...g,
      participantCount: counts[i],
    }));

    return NextResponse.json({ giveaways: result });
  } catch (error) {
    console.error('[GET /api/admin/giveaways]', error);
    return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = createGiveawaySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const {
      slugId,
      title,
      description,
      youtubeUrl,
      maxParticipants,
      status,
      startDate,
      endDate,
      timeZone,
      prizeDescription,
      approximateRetailValue,
      eligibilityCriteria,
    } = validation.data;

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Could not extract video ID.' }, { status: 422 });
    }

    await connectDB();

    // Check slug uniqueness
    const existing = await Giveaway.findOne({ slugId });
    if (existing) {
      return NextResponse.json({ error: `Slug "${slugId}" is already in use.` }, { status: 409 });
    }

    const giveaway = await Giveaway.create({
      slugId,
      title,
      description,
      youtubeUrl,
      youtubeVideoId: videoId,
      thumbnailUrl: getYouTubeThumbnail(videoId),
      maxParticipants,
      status,
      startDate,
      endDate,
      timeZone,
      prizeDescription,
      approximateRetailValue,
      eligibilityCriteria,
      winners: [],
    });

    return NextResponse.json({ success: true, giveaway }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/giveaways]', error);
    return NextResponse.json({ error: 'Failed to create giveaway' }, { status: 500 });
  }
}
