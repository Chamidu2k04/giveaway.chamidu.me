import Link from "next/link";
import Image from "next/image";
import { ProgressBar } from "@/components/ProgressBar";
import { Users, Trophy, Clock } from "lucide-react";

interface GiveawayCardProps {
  slugId: string;
  title: string;
  thumbnailUrl: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  participantCount?: number;
  maxParticipants?: number;
  winners?: { rank: number; name: string; maskedPhone: string }[];
}

const statusConfig = {
  ACTIVE: { label: "🔴 LIVE", class: "bg-red-500 text-white animate-pulse" },
  UPCOMING: { label: "⏳ Coming Soon", class: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" },
  COMPLETED: { label: "✅ Ended", class: "bg-white/10 text-gray-400" },
};

export function GiveawayCard({
  slugId,
  title,
  thumbnailUrl,
  status,
  participantCount = 0,
  maxParticipants,
  winners = [],
}: GiveawayCardProps) {
  const cfg = statusConfig[status];

  return (
    <Link
      href={status === "ACTIVE" ? `/giveaway/${slugId}` : `#`}
      className={`group block rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a1a] transition-all duration-300 ${
        status === "ACTIVE" ? "hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${cfg.class}`}>
          {cfg.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white text-base leading-snug line-clamp-2">{title}</h3>

        {/* Active giveaway progress */}
        {status === "ACTIVE" && maxParticipants && (
          <ProgressBar current={participantCount} max={maxParticipants} />
        )}
        {status === "ACTIVE" && !maxParticipants && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users className="h-3.5 w-3.5" />
            <span>{participantCount.toLocaleString()} participants</span>
          </div>
        )}

        {/* Upcoming */}
        {status === "UPCOMING" && (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Giveaway opening soon — stay tuned!</span>
          </div>
        )}

        {/* Completed — show winners */}
        {status === "COMPLETED" && winners.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
              <Trophy className="h-3 w-3" />
              <span>Winners</span>
            </div>
            {winners.slice(0, 3).map((w) => (
              <div key={w.rank} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="w-5 text-center font-bold text-yellow-400">#{w.rank}</span>
                <span className="truncate">{w.name}</span>
                <span className="ml-auto font-mono text-gray-500">{w.maskedPhone}</span>
              </div>
            ))}
            {winners.length > 3 && (
              <p className="text-xs text-gray-500">+{winners.length - 3} more winners</p>
            )}
          </div>
        )}

        {status === "ACTIVE" && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">Tap to enter</span>
            <span className="text-xs font-semibold text-red-400">Enter Now →</span>
          </div>
        )}
      </div>
    </Link>
  );
}
