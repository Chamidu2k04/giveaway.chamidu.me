"use client";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
}

export function ProgressBar({ current, max, className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const color =
    pct >= 90 ? "from-red-500 to-red-400" :
    pct >= 60 ? "from-yellow-500 to-orange-400" :
    "from-green-500 to-emerald-400";

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{current.toLocaleString()} entered</span>
        <span>{max.toLocaleString()} max</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
