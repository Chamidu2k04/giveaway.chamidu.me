import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";

export async function GET() {
  try {
    await connectDB();

    const [active, upcoming, completed] = await Promise.all([
      Giveaway.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).lean(),
      Giveaway.find({ status: 'UPCOMING' }).sort({ createdAt: -1 }).lean(),
      Giveaway.find({ status: 'COMPLETED' }).sort({ updatedAt: -1 }).limit(20).lean(),
    ]);

    return NextResponse.json(
      { active, upcoming, completed },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/giveaways]', error);
    return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 });
  }
}
