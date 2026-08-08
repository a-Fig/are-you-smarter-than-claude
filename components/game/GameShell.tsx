"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ModelKey } from "@/lib/models";
import { MODELS } from "@/lib/models";
import type { MatchStats } from "@/lib/match";
import { ModelPicker } from "./ModelPicker";
import { StatsBar } from "./StatsBar";
import { ResultCard, type Outcome } from "./ResultCard";

export const BRUTAL_FONT =
  "[font-family:'Archivo_Black','Arial_Black',Arial,sans-serif]";

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
        {error ? (
          <p className="border-2 border-black bg-[#FF5C39] px-3 py-1 font-sans text-sm font-bold text-black shadow-[3px_3px_0_#000]">
            {error}
          </p>
        ) : trashTalk ? (
          <p className="max-w-md border-2 border-black bg-white px-3 py-1 font-sans text-sm font-medium italic shadow-[3px_3px_0_#000]">
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
