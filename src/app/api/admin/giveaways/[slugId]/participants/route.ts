import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { maskPhone } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') return null;
  return session;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slugId } = await params;
    await connectDB();

    const giveaway = await Giveaway.findOne({ slugId });
    if (!giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const raw = url.searchParams.get('raw') === 'true';

    const participants = await Participant.find({ giveawayId: giveaway._id })
      .sort({ createdAt: -1 })
      .lean();

    const result = participants.map((p) => ({
      _id: p._id,
      fullName: p.fullName,
      phone: raw ? p.phone : maskPhone(p.phone),
      youtubeUsername: p.youtubeUsername,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ participants: result, total: result.length });
  } catch (error) {
    console.error('[GET /api/admin/giveaways/[slugId]/participants]', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}
