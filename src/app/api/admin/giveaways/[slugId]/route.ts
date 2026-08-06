import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/utils";

const updateGiveawaySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  youtubeUrl: z.string().url().optional(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slugId } = await params;
    const body = await req.json();
    const validation = updateGiveawaySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await connectDB();
    const updateData: Record<string, unknown> = { ...validation.data };

    if (validation.data.youtubeUrl) {
      const videoId = extractYouTubeVideoId(validation.data.youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 422 });
      }
      updateData.youtubeVideoId = videoId;
      updateData.thumbnailUrl = getYouTubeThumbnail(videoId);
    }

    const giveaway = await Giveaway.findOneAndUpdate(
      { slugId },
      { $set: updateData },
      { new: true }
    );

    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, giveaway });
  } catch (error) {
    console.error('[PATCH /api/admin/giveaways/[slugId]]', error);
    return NextResponse.json({ error: 'Failed to update giveaway' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slugId } = await params;
    await connectDB();
    const giveaway = await Giveaway.findOneAndDelete({ slugId });
    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/giveaways/[slugId]]', error);
    return NextResponse.json({ error: 'Failed to delete giveaway' }, { status: 500 });
  }
}
