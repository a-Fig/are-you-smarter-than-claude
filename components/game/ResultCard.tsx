"use client";

import Link from "next/link";
import { fmtSeconds, fmtUsd, type MatchStats } from "@/lib/match";

export type Outcome = "win" | "loss" | "draw";

function Verdict({ label, you, claude, winner }: {
  label: string;
  you: string;
  claude: string;
  winner: "you" | "claude" | "tie";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0">
      <span className="w-20 text-left font-medium capitalize">{label}</span>
      <span className={winner === "you" ? "font-semibold text-accent" : "text-muted"}>
        You: {you}
      </span>
      <span className={winner === "claude" ? "font-semibold text-accent" : "text-muted"}>
        Claude: {claude}
      </span>
    </div>
  );
}

export function ResultCard({
  outcome,
  stats,
  modelLabel,
  onRematch,
}: {
  outcome: Outcome;
  stats: MatchStats;
  modelLabel: string;
  onRematch: () => void;
}) {
  const headline =
    outcome === "win"
      ? `You beat ${modelLabel}!`
      : outcome === "loss"
        ? `${modelLabel} wins this one.`
        : "It's a draw.";

  const fasterWinner =
    stats.human.timeMs === stats.claude.timeMs
      ? "tie"
      : stats.human.timeMs < stats.claude.timeMs
        ? "you"
        : "claude";

  const consolation =
    outcome !== "win"
      ? [
          fasterWinner === "you" ? "faster" : null,
          "cheaper",
        ]
          .filter(Boolean)
          .join(" and ")
      : null;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-white/60 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight">{headline}</h2>
      {consolation && (
        <p className="text-sm text-muted">…but hey, you were {consolation}.</p>
      )}
      <div className="w-full">
        <Verdict
          label="smarter"
          you={outcome === "win" ? "W" : outcome === "draw" ? "–" : "L"}
          claude={outcome === "loss" ? "W" : outcome === "draw" ? "–" : "L"}
          winner={outcome === "win" ? "you" : outcome === "loss" ? "claude" : "tie"}
        />
        <Verdict
          label="faster"
          you={fmtSeconds(stats.human.timeMs)}
          claude={fmtSeconds(stats.claude.timeMs)}
          winner={fasterWinner}
        />
        <Verdict
          label="cheaper"
          you="$0.00"
          claude={fmtUsd(stats.claude.costUsd)}
          winner="you"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          onClick={onRematch}
          className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Rematch
        </button>
        <Link
          href="/play"
          className="rounded-full border border-border px-6 py-2 text-sm font-medium hover:border-accent"
        >
          All games
        </Link>
      </div>
    </div>
  );
}
