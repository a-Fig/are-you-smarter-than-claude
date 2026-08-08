"use client";

import { fmtSeconds, fmtUsd, type MatchStats } from "@/lib/match";

export function StatsBar({
  stats,
  modelLabel,
  thinking,
}: {
  stats: MatchStats;
  modelLabel: string;
  thinking: boolean;
}) {
  return (
    <div className="flex w-full max-w-md items-stretch justify-between gap-3 border-3 border-black bg-white px-5 py-3 text-sm shadow-[4px_4px_0_#000]">
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase tracking-[0.15em] text-black/70">You</span>
        <span>{fmtSeconds(stats.human.timeMs)}</span>
        <span className="font-sans text-xs font-bold text-black/60">
          $0.00 · free range human
        </span>
      </div>
      <div className="flex flex-col items-end text-right">
        <span className="text-[10px] uppercase tracking-[0.15em] text-black/70">
          {modelLabel}
          {thinking && <span className="ml-1 animate-pulse text-[#FF5C39]">■</span>}
        </span>
        <span>{fmtSeconds(stats.claude.timeMs)}</span>
        <span className="font-sans text-xs font-bold text-black/60">
          {fmtUsd(stats.claude.costUsd)} · {stats.claude.tokens.toLocaleString()} tokens
        </span>
      </div>
    </div>
  );
}
