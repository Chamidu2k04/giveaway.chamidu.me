import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;
    await connectDB();

    const giveaway = await Giveaway.findOne({ slugId }).lean();
    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    const participantCount = await Participant.countDocuments({ giveawayId: giveaway._id });

    return NextResponse.json({ ...giveaway, participantCount });
  } catch (error) {
    console.error('[GET /api/giveaways/[slugId]]', error);
    return NextResponse.json({ error: 'Failed to fetch giveaway' }, { status: 500 });
  }
}
