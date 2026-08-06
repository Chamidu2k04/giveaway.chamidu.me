import { auth, signOut } from "@/auth";
import Link from "next/link";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import { Plus, LogOut, Gift, Users, Trophy, Zap, Settings, ChevronRight } from "lucide-react";

export const metadata = { title: "Dashboard" };

async function getStats() {
  await connectDB();
  const [total, active, completed, totalParticipants] = await Promise.all([
    Giveaway.countDocuments(),
    Giveaway.countDocuments({ status: 'ACTIVE' }),
    Giveaway.countDocuments({ status: 'COMPLETED' }),
    Participant.countDocuments(),
  ]);
  const recentGiveaways = await Giveaway.find().sort({ createdAt: -1 }).limit(5).lean();
  const counts = await Promise.all(
    recentGiveaways.map((g) => Participant.countDocuments({ giveawayId: g._id }))
  );
  return { total, active, completed, totalParticipants, recentGiveaways, counts };
}

const statusConfig = {
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  UPCOMING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  COMPLETED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default async function AdminDashboard() {
  const session = await auth();
  const { total, active, completed, totalParticipants, recentGiveaways, counts } = await getStats();

  return (
    <div className="min-h-screen">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Dashboard</p>
              <p className="text-xs text-gray-400">Welcome, {session?.user?.name}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <button type="submit" className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-white hover:border-white/30 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Giveaways", value: total, icon: <Gift className="h-5 w-5" />, color: "text-blue-400" },
            { label: "Live Now", value: active, icon: <Zap className="h-5 w-5" />, color: "text-green-400" },
            { label: "Completed", value: completed, icon: <Trophy className="h-5 w-5" />, color: "text-yellow-400" },
            { label: "Total Entries", value: totalParticipants, icon: <Users className="h-5 w-5" />, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-black text-white">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/giveaways/new"
            className="flex h-10 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Giveaway
          </Link>
          <Link
            href="/admin/giveaways"
            className="flex h-10 items-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-gray-300 hover:text-white hover:border-white/40 transition-colors"
          >
            <Gift className="h-4 w-4" />
            All Giveaways
          </Link>
        </div>

        {/* Recent Giveaways */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Recent Giveaways</h2>
          <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
            {recentGiveaways.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Gift className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No giveaways yet. Create your first one!</p>
              </div>
            ) : (
              recentGiveaways.map((g, i) => (
                <Link
                  key={g.slugId}
                  href={`/admin/giveaways/${g.slugId}`}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{g.title}</p>
                    <p className="text-xs text-gray-400">/{g.slugId} · {counts[i]} participants</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[g.status]}`}>
                    {g.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
