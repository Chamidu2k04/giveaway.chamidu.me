"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Trophy, Play, ChevronDown, Save } from "lucide-react";


interface Participant {
  _id: string;
  fullName: string;
  phone: string;
  youtubeUsername: string;
}

interface Winner {
  rank: number;
  participantId: string;
  name: string;
  phone: string;
  youtubeUsername: string;
}

type Stage = "idle" | "shuffling" | "revealing" | "done";

interface WinnerSlotMachineProps {
  participants: Participant[];
  slugId: string;
  winnerCount?: number;
  onComplete?: () => void;
}

function playBeep(freq: number = 880, dur: number = 0.15) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

function playFanfare() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((note, i) => {
    setTimeout(() => playBeep(note, 0.3), i * 150);
  });
}

export function WinnerSlotMachine({
  participants,
  slugId,
  winnerCount = 10,
  onComplete,
}: WinnerSlotMachineProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [currentRevealRank, setCurrentRevealRank] = useState(winnerCount);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const shuffleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const actualWinnerCount = Math.min(winnerCount, participants.length);

  // Fisher-Yates shuffle to pick winners
  const pickWinners = useCallback((): Winner[] => {
    const pool = [...participants];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, actualWinnerCount).map((p, i) => ({
      rank: i + 1,
      participantId: p._id,
      name: p.fullName,
      phone: p.phone,
      youtubeUsername: p.youtubeUsername,
    }));
  }, [participants, actualWinnerCount]);

  const startDraw = () => {
    const picked = pickWinners();
    setWinners(picked);
    setRevealedWinners([]);
    setCurrentRevealRank(actualWinnerCount);
    setStage("shuffling");
  };

  // Slot machine shuffle animation
  useEffect(() => {
    if (stage !== "shuffling") return;
    let speed = 80;
    let elapsed = 0;
    const total = 4000; // 4 seconds of shuffling

    const tick = () => {
      setShuffleIndex((i) => (i + 1) % participants.length);
      playBeep(400 + Math.random() * 400, 0.05);
      elapsed += speed;
      speed = Math.min(speed + 4, 300); // gradually slow down
      if (elapsed < total) {
        shuffleRef.current = setTimeout(tick, speed);
      } else {
        setStage("revealing");
        setCurrentRevealRank(actualWinnerCount);
      }
    };
    shuffleRef.current = setTimeout(tick, speed);
    return () => { if (shuffleRef.current) clearTimeout(shuffleRef.current); };
  }, [stage, participants.length, actualWinnerCount]);

  // Reveal each winner with countdown
  useEffect(() => {
    if (stage !== "revealing") return;

    let count = 3;
    const initTimer = setTimeout(() => {
      setCountdown(count);
    }, 0);

    const cd = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playBeep(440, 0.1);
      } else {
        clearInterval(cd);
        setCountdown(null);

        // Reveal the current rank winner
        const winner = winners[currentRevealRank - 1];
        if (winner) {
          setRevealedWinners((prev) => [winner, ...prev]);
          setConfettiTrigger(true);
          setTimeout(() => setConfettiTrigger(false), 100);
          playFanfare();

          // Move to next rank or finish
          setTimeout(() => {
            if (currentRevealRank > 1) {
              setCurrentRevealRank((r) => r - 1);
            } else {
              setStage("done");
            }
          }, 2500);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(cd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentRevealRank]);

  const saveWinners = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/giveaways/${slugId}/winners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: winners.map((w) => w.participantId),
        }),
      });
      if (res.ok) {
        setSaved(true);
        onComplete?.();
      }
    } catch {
      alert("Failed to save winners. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const rankColors: Record<number, string> = {
    1: "from-yellow-400 to-amber-300 text-black",
    2: "from-gray-300 to-gray-200 text-black",
    3: "from-amber-600 to-amber-500 text-white",
  };
  const getRankStyle = (rank: number) =>
    rankColors[rank] || "from-white/10 to-white/5 text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6 space-y-6">
      <ConfettiEffect trigger={confettiTrigger} mode="winner" />

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Winner Selection</h2>
        </div>
        <p className="text-sm text-gray-400">{participants.length} participants in the draw</p>
      </div>

      {/* STAGE: IDLE */}
      {stage === "idle" && (
        <div className="text-center space-y-4 py-4">
          {participants.length < actualWinnerCount ? (
            <p className="text-yellow-400 text-sm">⚠️ Not enough participants to select {actualWinnerCount} winners.</p>
          ) : (
            <>
              <p className="text-gray-300 text-sm">Ready to draw <span className="font-bold text-white">{actualWinnerCount}</span> winners from <span className="font-bold text-white">{participants.length}</span> entries.</p>
              <button
                onClick={startDraw}
                className="h-14 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-base font-bold text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
              >
                <Play className="h-5 w-5 mr-2" />
                Start the Draw!
              </button>
            </>
          )}
        </div>
      )}

      {/* STAGE: SHUFFLING */}
      {stage === "shuffling" && (
        <motion.div
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-2"
          animate={{ borderColor: ["rgba(239,68,68,0.3)", "rgba(239,68,68,0.8)", "rgba(239,68,68,0.3)"] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <p className="text-xs uppercase tracking-widest text-red-400 font-semibold">Shuffling entries...</p>
          <motion.p
            key={shuffleIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.05 }}
            className="text-2xl font-bold text-white truncate"
          >
            {participants[shuffleIndex]?.fullName || "..."}
          </motion.p>
          <p className="text-xs text-gray-500">Randomly cycling through all entries...</p>
        </motion.div>
      )}

      {/* STAGE: REVEALING */}
      {stage === "revealing" && (
        <div className="space-y-4">
          <motion.div
            className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-6 text-center space-y-3"
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <p className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
              Revealing #{currentRevealRank} Place
            </p>
            {countdown !== null ? (
              <motion.p
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-white"
              >
                {countdown}
              </motion.p>
            ) : (
              <AnimatePresence>
                {revealedWinners[0] && revealedWinners[0].rank === currentRevealRank + (revealedWinners.length > 0 ? 0 : 0) && (
                  <motion.div
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="space-y-1"
                  >
                    <p className="text-3xl font-black text-white">{revealedWinners[0]?.name}</p>
                    <p className="text-sm text-gray-400">@{revealedWinners[0]?.youtubeUsername}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>

          {/* Already revealed */}
          {revealedWinners.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Revealed so far</p>
              {revealedWinners.map((w) => (
                <motion.div
                  key={w.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${getRankStyle(w.rank)} p-3`}
                >
                  <span className="text-sm font-black w-6 text-center">#{w.rank}</span>
                  <span className="flex-1 font-semibold text-sm truncate">{w.name}</span>
                  <span className="text-xs opacity-70 font-mono">{w.phone}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STAGE: DONE */}
      {stage === "done" && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 p-4 text-center"
          >
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="font-bold text-white">All {actualWinnerCount} Winners Selected!</p>
          </motion.div>

          <div className="space-y-2">
            {revealedWinners
              .sort((a, b) => a.rank - b.rank)
              .map((w) => (
                <div
                  key={w.rank}
                  className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${getRankStyle(w.rank)} p-3`}
                >
                  <span className="text-sm font-black w-6 text-center">#{w.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{w.name}</p>
                    <p className="text-xs opacity-70">@{w.youtubeUsername}</p>
                  </div>
                  <span className="text-xs font-mono opacity-70">{w.phone}</span>
                </div>
              ))}
          </div>

          {!saved ? (
            <button
              onClick={saveWinners}
              disabled={saving}
              className="h-14 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-base font-bold text-white hover:scale-105 active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? "Saving Winners..." : "Save Winners & Complete Giveaway"}
            </button>
          ) : (
            <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-center text-green-400 font-semibold">
              ✅ Winners saved! Giveaway marked as COMPLETED.
            </div>
          )}

          {!saved && (
            <button
              onClick={() => { setStage("idle"); setRevealedWinners([]); setWinners([]); }}
              className="w-full border border-white/20 rounded-xl px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
              Redo Draw
            </button>
          )}
        </div>
      )}
    </div>
  );
}
