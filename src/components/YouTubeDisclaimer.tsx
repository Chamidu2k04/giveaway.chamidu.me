"use client";
import { AlertTriangle } from "lucide-react";

export function YouTubeDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-gray-500 mt-2 text-center">
        This contest is not sponsored, endorsed, or administered by, or associated with YouTube.
      </p>
    );
  }

  return (
    <div className="flex gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
      <div className="space-y-1.5 text-xs sm:text-sm">
        <p>
          <span className="font-semibold text-yellow-200">YouTube Disclaimer:</span> This contest is not sponsored, endorsed, or administered by, or associated with YouTube. YouTube is completely released from all liability related to this contest.
        </p>
        <p className="text-yellow-400/90 text-xs">
          All participants must comply with the{' '}
          <a
            href="https://www.youtube.com/howyoutubeworks/policies/community-guidelines/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white font-medium inline-flex items-center gap-0.5"
          >
            YouTube Community Guidelines
          </a>
          . Entries that do not comply will be disqualified.
        </p>
      </div>
    </div>
  );
}
