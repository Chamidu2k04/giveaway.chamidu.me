"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { WinnerSlotMachine } from "@/components/WinnerSlotMachine";

interface Participant {
  _id: string;
  fullName: string;
  phone: string;
  youtubeUsername: string;
}

export default function SelectWinnersPage() {
  const { slugId } = useParams<{ slugId: string }>();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [giveawayTitle, setGiveawayTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, pRes] = await Promise.all([
          fetch(`/api/giveaways/${slugId}`),
          fetch(`/api/admin/giveaways/${slugId}/participants?raw=true`),
        ]);
        const gData = await gRes.json();
        const pData = await pRes.json();
        setGiveawayTitle(gData.title || "");
        setParticipants(pData.participants || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slugId]);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3">
          <Link
            href={`/admin/giveaways/${slugId}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Select Winners
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
        {giveawayTitle && (
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white">{giveawayTitle}</h1>
            <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              {loading ? "Loading..." : `${participants.length} participants`}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <WinnerSlotMachine
            participants={participants}
            slugId={slugId}
            winnerCount={Math.min(10, participants.length)}
            onComplete={() => {
              setTimeout(() => router.push(`/admin/giveaways/${slugId}`), 2000);
            }}
          />
        )}
      </main>
    </div>
  );
}
