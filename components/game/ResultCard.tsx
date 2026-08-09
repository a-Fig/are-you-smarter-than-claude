"use client";

import Link from "next/link";
import { fmtSeconds, fmtUsd, type MatchStats } from "@/lib/match";

export type Outcome = "win" | "loss" | "draw";

/**
 * One line of the end-of-match recap. Either a you-vs-claude comparison
 * (set `you`/`claude`, optionally `winner` to highlight a side) or a single
 * centered fact (set `value`), e.g. the Wordle answer or a ✓✗ round strip.
 */
export interface RecapRow {
  label: string;
  you?: string;
  claude?: string;
  winner?: "you" | "claude" | "tie";
  value?: string;
}

function Recap({ rows }: { rows: RecapRow[] }) {
  return (
    <div className="w-full border-3 border-black bg-[#F5F0E8] px-4 py-2 shadow-[4px_4px_0_#000]">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b-2 border-black/20 py-2 text-sm last:border-b-0"
        >
          <span className="shrink-0 text-left text-[11px] uppercase tracking-wide">
            {row.label}
          </span>
          {row.value !== undefined ? (
            <span className="text-right font-sans font-bold">{row.value}</span>
          ) : (
            <span className="flex gap-3 text-right font-sans font-bold">
              <span
                className={
                  row.winner === "you" ? "bg-[#FF5C39] px-1.5 text-black" : "text-black/60"
                }
              >
                You: {row.you}
              </span>
              <span
                className={
                  row.winner === "claude" ? "bg-[#FF5C39] px-1.5 text-black" : "text-black/60"
                }
              >
                Claude: {row.claude}
              </span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Verdict({ label, you, claude, winner }: {
  label: string;
  you: string;
  claude: string;
  winner: "you" | "claude" | "tie";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-black py-2 text-sm last:border-b-0">
      <span className="w-20 text-left uppercase">{label}</span>
      <span
        className={`font-sans font-bold ${winner === "you" ? "bg-[#FF5C39] px-1.5 text-black" : "text-black/50"}`}
      >
        You: {you}
      </span>
      <span
        className={`font-sans font-bold ${winner === "claude" ? "bg-[#FF5C39] px-1.5 text-black" : "text-black/50"}`}
      >
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
  recap,
  onViewBoard,
}: {
  outcome: Outcome;
  stats: MatchStats;
  modelLabel: string;
  onRematch: () => void;
  recap?: RecapRow[];
  onViewBoard?: () => void;
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
    <div className="flex w-full max-w-md flex-col items-center gap-4 border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000]">
      <h2 className="text-center text-2xl uppercase tracking-tight">{headline}</h2>
      {consolation && (
        <p className="font-sans text-sm font-bold text-black/70">
          …but hey, you were {consolation}.
        </p>
      )}
      {recap && recap.length > 0 && <Recap rows={recap} />}
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
        <Verdict label="cheaper" you="$0.00" claude={fmtUsd(stats.claude.costUsd)} winner="you" />
      </div>
      <div className="flex gap-4 pt-1">
        <button
          onClick={onRematch}
          className="border-3 border-black bg-[#FF5C39] px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          Rematch
        </button>
        {onViewBoard && (
          <button
            onClick={onViewBoard}
            className="border-3 border-black bg-white px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
          >
            Final board
          </button>
        )}
        <Link
          href="/play"
          className="border-3 border-black bg-white px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
        >
          All games
        </Link>
      </div>
    </div>
  );
}
