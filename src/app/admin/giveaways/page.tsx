import { auth } from "@/auth";
import Link from "next/link";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { Plus, ChevronRight, ArrowLeft, Gift } from "lucide-react";

export const metadata = { title: "All Giveaways" };

export default async function GiveawaysListPage() {
  await auth();
  await connectDB();
  const giveaways = await Giveaway.find().sort({ createdAt: -1 }).lean();
  const counts = await Promise.all(
    giveaways.map((g) => Participant.countDocuments({ giveawayId: g._id }))
  );

  const statusConfig: Record<string, string> = {
    ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
    UPCOMING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    COMPLETED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm font-semibold text-white">All Giveaways</span>
          </div>
          <Link
            href="/admin/giveaways/new"
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
          {giveaways.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Gift className="h-12 w-12 mx-auto text-gray-600" />
              <p className="text-gray-400">No giveaways yet.</p>
              <Link href="/admin/giveaways/new" className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600">
                <Plus className="h-4 w-4" /> Create First Giveaway
              </Link>
            </div>
          ) : (
            giveaways.map((g, i) => (
              <Link
                key={g.slugId}
                href={`/admin/giveaways/${g.slugId}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{g.title}</p>
                  <p className="text-xs text-gray-400">
                    slug: <span className="font-mono text-gray-300">/{g.slugId}</span>
                    {" · "}{counts[i].toLocaleString()} entries
                    {g.maxParticipants && ` / ${g.maxParticipants.toLocaleString()} max`}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 ${statusConfig[g.status]}`}>
                  {g.status}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
