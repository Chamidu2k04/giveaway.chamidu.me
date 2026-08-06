"use client";
import { AlertTriangle } from "lucide-react";

export function YouTubeDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-gray-500 mt-2 text-center">
        Not sponsored, endorsed, or administered by YouTube. YouTube is released from all liability.
      </p>
    );
  }

  return (
    <div className="flex gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <p>
        <span className="font-semibold">YouTube Disclaimer:</span> This giveaway is not sponsored, endorsed, or
        administered by YouTube LLC. YouTube is completely released from all liability related to this contest.
        Participation is subject to the channel&apos;s own terms.
      </p>
    </div>
  );
}
