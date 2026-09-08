"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Users, Trophy, ExternalLink,
  Copy, Check, Trash2
} from "lucide-react";

interface Participant {
  _id: string;
  fullName: string;
  phone: string;
  youtubeUsername: string;
  createdAt: string;
}

interface Giveaway {
  slugId: string;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  maxParticipants?: number;
  participantCount: number;
  winners: { rank: number; name: string; maskedPhone: string }[];
  createdAt: string;
}

const statusConfig = {
  ACTIVE: { label: 'ACTIVE', class: 'text-green-400 border-green-400/20 bg-green-400/10' },
  UPCOMING: { label: 'UPCOMING', class: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' },
  COMPLETED: { label: 'COMPLETED', class: 'text-gray-400 border-gray-400/20 bg-gray-400/10' },
};

export default function AdminGiveawayDetailPage() {
  const { slugId } = useParams<{ slugId: string }>();
  const router = useRouter();
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [gRes, pRes] = await Promise.all([
        fetch(`/api/giveaways/${slugId}`),
        fetch(`/api/admin/giveaways/${slugId}/participants`),
      ]);
      const gData = await gRes.json();
      const pData = await pRes.json();
      setGiveaway(gData);
      setParticipants(pData.participants || []);
    } finally {
      setLoading(false);
    }
  }, [slugId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateStatus = async (status: string) => {
    setUpdatingStatus(true);
    await fetch(`/api/admin/giveaways/${slugId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchData();
    setUpdatingStatus(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/giveaway/${slugId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteGiveaway = async () => {
    if (!confirm(`Delete "${giveaway?.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/giveaways/${slugId}`, { method: 'DELETE' });
    router.push('/admin/giveaways');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Giveaway not found.
      </div>
    );
  }

  const cfg = statusConfig[giveaway.status];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/giveaways" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Giveaways
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm font-semibold text-white truncate max-w-[200px]">{giveaway.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-xs text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button
              onClick={deleteGiveaway}
              disabled={deleting}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red-500/30 px-3 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Thumbnail */}
          <div className="lg:col-span-1">
            <div className="aspect-video relative rounded-2xl overflow-hidden border border-white/10">
              <Image src={giveaway.thumbnailUrl} alt={giveaway.title} fill className="object-cover" />
            </div>
            <div className="mt-3 space-y-2">
              <a
                href={giveaway.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open YouTube Video
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-xl font-black text-white">{giveaway.title}</h1>
              <p className="text-sm text-gray-400">/giveaway/{giveaway.slugId}</p>
            </div>

            {/* Status badge + stats */}
            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${cfg.class}`}>
                {cfg.label}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-gray-300">
                <Users className="h-4 w-4" />
                {(giveaway.participantCount || 0).toLocaleString()} entries
                {giveaway.maxParticipants && ` / ${giveaway.maxParticipants.toLocaleString()} max`}
              </div>
            </div>

            {/* Status controls */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Status</p>
              <div className="flex flex-wrap gap-2">
                {(['UPCOMING', 'ACTIVE', 'COMPLETED'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updatingStatus || giveaway.status === s}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                      giveaway.status === s
                        ? `${statusConfig[s].class} cursor-default`
                        : 'border-white/20 text-gray-400 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Winner Selection (only for ACTIVE) */}
            {giveaway.status === 'ACTIVE' && (giveaway.participantCount || 0) > 0 && (
              <Link
                href={`/admin/giveaways/${slugId}/select-winners`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-sm font-bold text-black hover:scale-[1.02] transition-transform"
              >
                <Trophy className="h-4 w-4" />
                Select Winners
              </Link>
            )}

            {/* Winners display */}
            {giveaway.winners && giveaway.winners.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Winners</p>
                <div className="space-y-1.5">
                  {giveaway.winners.sort((a, b) => a.rank - b.rank).map((w) => (
                    <div key={w.rank} className="flex items-center gap-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 px-3 py-2">
                      <span className="text-xs font-black text-yellow-400 w-5 text-center">#{w.rank}</span>
                      <span className="flex-1 text-sm font-semibold text-white truncate">{w.name}</span>
                      <span className="text-xs font-mono text-gray-400">{w.maskedPhone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Participants</h2>
            <span className="text-sm text-gray-400">{participants.length} total</span>
          </div>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            {participants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No participants yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">YouTube</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {participants.map((p, i) => (
                      <tr key={p._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-gray-500 tabular-nums">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-medium">{p.fullName}</td>
                        <td className="px-4 py-3 font-mono text-gray-300">{p.phone}</td>
                        <td className="px-4 py-3 text-gray-300">@{p.youtubeUsername}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
