"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ModelKey } from "@/lib/models";
import { MODELS } from "@/lib/models";
import type { MatchStats } from "@/lib/match";
import { ModelPicker } from "./ModelPicker";
import { StatsBar } from "./StatsBar";
import { ResultCard, type Outcome } from "./ResultCard";

/**
 * Standard chrome for every game page: header + model picker + live
 * scoreboard + trash-talk bubble + result card. The game board goes in
 * `children`. Lock the model picker once the first move is made.
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
  children: ReactNode;
}) {
  const modelLabel = MODELS[model].label;
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-12">
      <header className="flex w-full max-w-md items-center justify-between">
        <Link href="/play" className="text-sm font-medium text-accent hover:underline">
          ← Games
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <span className="w-14" />
      </header>

      <ModelPicker value={model} onChange={onModelChange} locked={modelLocked} />
      <StatsBar stats={stats} modelLabel={modelLabel} thinking={thinking} />

      <div className="flex min-h-6 items-center px-4 text-center">
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : trashTalk ? (
          <p className="max-w-md text-sm italic text-muted">
            “{trashTalk}” — {modelLabel}
          </p>
        ) : null}
      </div>

      {outcome ? (
        <ResultCard
          outcome={outcome}
          stats={stats}
          modelLabel={modelLabel}
          onRematch={onRematch}
        />
      ) : (
        children
      )}
    </main>
  );
}
