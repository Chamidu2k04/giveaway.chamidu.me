import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { maskPhone } from "@/lib/utils";

const winnerSchema = z.object({
  participantIds: z.array(z.string()).min(1).max(10),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slugId } = await params;
    const body = await req.json();
    const validation = winnerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await connectDB();
    const giveaway = await Giveaway.findOne({ slugId });
    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    const { participantIds } = validation.data;

    // Fetch winner participants in the order provided (order = ranking)
    const participants = await Participant.find({
      _id: { $in: participantIds },
      giveawayId: giveaway._id,
    }).lean();

    // Build winners array preserving the order from participantIds (rank 1 = first in array)
    const orderedWinners = participantIds.map((id, index) => {
      const participant = participants.find((p) => p._id.toString() === id);
      if (!participant) throw new Error(`Participant ${id} not found`);
      return {
        rank: index + 1,
        name: participant.fullName,
        maskedPhone: maskPhone(participant.phone),
      };
    });

    await Giveaway.findOneAndUpdate(
      { slugId },
      {
        $set: {
          winners: orderedWinners,
          status: 'COMPLETED',
        },
      }
    );

    return NextResponse.json({ success: true, winners: orderedWinners });
  } catch (error) {
    console.error('[POST /api/admin/giveaways/[slugId]/winners]', error);
    return NextResponse.json({ error: 'Failed to save winners' }, { status: 500 });
  }
}
