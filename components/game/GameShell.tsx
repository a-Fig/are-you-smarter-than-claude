"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { ModelKey } from "@/lib/models";
import { MODELS } from "@/lib/models";
import type { MatchStats } from "@/lib/match";
import { ModelPicker } from "./ModelPicker";
import { StatsBar } from "./StatsBar";
import { ResultCard, type Outcome, type RecapRow } from "./ResultCard";

export const BRUTAL_FONT =
  "[font-family:'Archivo_Black','Arial_Black',Arial,sans-serif]";

/**
 * Standard chrome for every game page: header + model picker + live
 * scoreboard + trash-talk bubble + result card. The game board goes in
 * `children`. Lock the model picker once the first move is made.
 *
 * When `outcome` is set, the board stays visible for `revealDelayMs`
 * (default 2s) so the final move can be seen before the result card takes
 * over; the card offers a "Final board" button to flip back. `recap` rows
 * (score, rounds, closeness) render inside the result card.
 */
export function GameShell({
  title,
  model,
  onModelChange,
  modelLocked,
  stats,
  thinking,
  trashTalk,
  outcome,
  onRematch,
  error,
  recap,
  revealDelayMs = 2000,
  children,
}: {
  title: string;
  model: ModelKey;
  onModelChange: (m: ModelKey) => void;
  modelLocked: boolean;
  stats: MatchStats;
  thinking: boolean;
  trashTalk: string | null;
  outcome: Outcome | null;
  onRematch: () => void;
  error: string | null;
  recap?: RecapRow[];
  revealDelayMs?: number;
  children: ReactNode;
}) {
  const modelLabel = MODELS[model].label;
  const [showResult, setShowResult] = useState(false);
  const [reviewingBoard, setReviewingBoard] = useState(false);

  // Reset the reveal state the moment `outcome` flips (rematch or game end),
  // using render-time state adjustment instead of an effect.
  const [prevOutcome, setPrevOutcome] = useState<Outcome | null>(outcome);
  if (outcome !== prevOutcome) {
    setPrevOutcome(outcome);
    setShowResult(outcome !== null && revealDelayMs <= 0);
    setReviewingBoard(false);
  }

  useEffect(() => {
    if (outcome === null || revealDelayMs <= 0) return;
    const timer = setTimeout(() => setShowResult(true), revealDelayMs);
    return () => clearTimeout(timer);
  }, [outcome, revealDelayMs]);

  const boardVisible = outcome === null || !showResult || reviewingBoard;
  return (
    <main
      className={`flex flex-1 flex-col items-center gap-6 bg-[#F5F0E8] px-6 py-10 text-black ${BRUTAL_FONT}`}
    >
      <header className="flex w-full max-w-md items-center justify-between gap-3">
        <Link
          href="/play"
          className="border-2 border-black bg-white px-3 py-1 text-xs uppercase tracking-wide shadow-[3px_3px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
        >
          ← Games
        </Link>
        <h1 className="text-xl uppercase tracking-tight sm:text-2xl">{title}</h1>
        <span className="w-16" />
      </header>

      <ModelPicker value={model} onChange={onModelChange} locked={modelLocked} />
      <StatsBar stats={stats} modelLabel={modelLabel} thinking={thinking} />

      <div className="flex min-h-8 items-center px-4 text-center">
        {outcome && !showResult ? (
          <p className="border-2 border-black bg-[#FF5C39] px-3 py-1 text-sm uppercase tracking-wide text-black shadow-[3px_3px_0_#000]">
            Match over — tallying the score…
          </p>
        ) : error ? (
          <p className="border-2 border-black bg-[#FF5C39] px-3 py-1 font-sans text-sm font-bold text-black shadow-[3px_3px_0_#000]">
            {error}
          </p>
        ) : trashTalk ? (
          <p className="max-w-md border-2 border-black bg-white px-3 py-1 font-sans text-sm font-medium italic shadow-[3px_3px_0_#000]">
            “{trashTalk}” — {modelLabel}
          </p>
        ) : null}
      </div>

      {boardVisible ? (
        <>
          {children}
          {outcome && showResult && (
            <button
              onClick={() => setReviewingBoard(false)}
              className="border-3 border-black bg-[#FF5C39] px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
            >
              Back to results
            </button>
          )}
        </>
      ) : (
        <ResultCard
          outcome={outcome as Outcome}
          stats={stats}
          modelLabel={modelLabel}
          onRematch={onRematch}
          recap={recap}
          onViewBoard={() => setReviewingBoard(true)}
        />
      )}
    </main>
  );
}
