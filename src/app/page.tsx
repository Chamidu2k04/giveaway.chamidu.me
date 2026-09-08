import Link from "next/link";
import { Youtube } from "@/components/YoutubeIcon";
import { Gift, Trophy, Clock, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GiveawayCard } from "@/components/GiveawayCard";
import { connectDB } from "@/lib/mongoose";
import Giveaway from "@/models/Giveaway";
import Participant from "@/models/Participant";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Giveaways",
};

export const revalidate = 60; // Revalidate every 60 seconds

async function getGiveawayData() {
  try {
    await connectDB();
    const [active, upcoming, completed] = await Promise.all([
      Giveaway.find({ status: "ACTIVE" }).sort({ createdAt: -1 }).lean(),
      Giveaway.find({ status: "UPCOMING" }).sort({ createdAt: -1 }).lean(),
      Giveaway.find({ status: "COMPLETED" }).sort({ updatedAt: -1 }).limit(12).lean(),
    ]);

    const uncountedIds = [...active, ...upcoming, ...completed]
      .filter((g) => typeof g.participantCount !== "number")
      .map((g) => g._id);

    let countMap: Record<string, number> = {};
    if (uncountedIds.length > 0) {
      const counts = await Participant.aggregate([
        { $match: { giveawayId: { $in: uncountedIds } } },
        { $group: { _id: "$giveawayId", count: { $sum: 1 } } },
      ]);
      countMap = Object.fromEntries(
        counts.map((c: { _id: { toString(): string }; count: number }) => [c._id.toString(), c.count])
      );
    }

    return { active, upcoming, completed, countMap };
  } catch (error) {
    console.error("DB Connection failed during static generation:", error);
    return { active: [], upcoming: [], completed: [], countMap: {} };
  }
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white font-outfit">{title}</h2>
    </div>
  );
}

export default async function HomePage() {
  const { active, upcoming, completed, countMap } = await getGiveawayData();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[400px] rounded-full bg-red-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Channel badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            <Zap className="h-3.5 w-3.5 text-red-400" />
            Tech Gadgets & Reviews
          </div>

          <h1 className="font-outfit text-4xl font-black tracking-tight text-white sm:text-6xl">
            Chamidu Herath
            <span className="block text-gradient mt-1">Giveaways</span>
          </h1>

          <p className="mt-6 text-base text-gray-400 sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Win amazing tech prizes from Sri Lanka&apos;s premier tech gadgets and review YouTube channel.
            Enter our giveaways, check out the latest tech reviews, and be part of our community!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.youtube.com/@ChamiduHerathICT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-red-500 px-8 font-bold text-white transition-all hover:bg-red-600 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
            >
              <Youtube className="h-5 w-5" />
              Subscribe on YouTube
            </a>
            {active.length > 0 && (
              <Link
                href={`/giveaway/${active[0].slugId}`}
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 px-8 font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                <Gift className="h-5 w-5" />
                Enter Active Giveaway
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-white/3 px-4 py-6">
        <div className="mx-auto max-w-5xl grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-red-400">{active.length}</p>
            <p className="text-xs text-gray-400">Live Now</p>
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-400">{upcoming.length}</p>
            <p className="text-xs text-gray-400">Coming Soon</p>
          </div>
          <div>
            <p className="text-2xl font-black text-green-400">{completed.length}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {/* Active Giveaways */}
        {active.length > 0 && (
          <section id="active">
            <SectionTitle icon={<Zap className="h-5 w-5" />} title="Live Giveaways" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((g) => (
                <GiveawayCard
                  key={g.slugId}
                  slugId={g.slugId}
                  title={g.title}
                  thumbnailUrl={g.thumbnailUrl}
                  status="ACTIVE"
                  participantCount={g.participantCount ?? countMap[g._id.toString()] ?? 0}
                  maxParticipants={g.maxParticipants}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section id="upcoming">
            <SectionTitle icon={<Clock className="h-5 w-5" />} title="Upcoming Giveaways" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((g) => (
                <GiveawayCard
                  key={g.slugId}
                  slugId={g.slugId}
                  title={g.title}
                  thumbnailUrl={g.thumbnailUrl}
                  status="UPCOMING"
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed / Archive */}
        {completed.length > 0 && (
          <section id="completed">
            <SectionTitle icon={<Trophy className="h-5 w-5" />} title="Past Giveaways & Winners" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((g) => (
                <GiveawayCard
                  key={g.slugId}
                  slugId={g.slugId}
                  title={g.title}
                  thumbnailUrl={g.thumbnailUrl}
                  status="COMPLETED"
                  participantCount={g.participantCount ?? countMap[g._id.toString()] ?? 0}
                  winners={g.winners}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {active.length === 0 && upcoming.length === 0 && completed.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Gift className="h-16 w-16 text-gray-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-400">No giveaways yet</h2>
            <p className="text-gray-500">Check back soon! Follow the channel to be notified first.</p>
            <a
              href="https://www.youtube.com/@ChamiduHerathICT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
            >
              <Youtube className="h-4 w-4" />
              Subscribe for Updates
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
