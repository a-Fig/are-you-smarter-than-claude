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
    <div className="flex w-full max-w-md items-stretch justify-between gap-3 rounded-2xl border border-border bg-white/40 px-5 py-3 text-sm">
      <div className="flex flex-col items-start">
        <span className="text-xs uppercase tracking-wider text-muted">You</span>
        <span className="font-medium">{fmtSeconds(stats.human.timeMs)}</span>
        <span className="text-xs text-muted">$0.00 · free range human</span>
      </div>
      <div className="flex flex-col items-end text-right">
        <span className="text-xs uppercase tracking-wider text-muted">
          {modelLabel}
          {thinking && <span className="ml-1 animate-pulse text-accent">●</span>}
        </span>
        <span className="font-medium">{fmtSeconds(stats.claude.timeMs)}</span>
        <span className="text-xs text-muted">
          {fmtUsd(stats.claude.costUsd)} · {stats.claude.tokens.toLocaleString()} tokens
        </span>
      </div>
    </div>
  );
}
