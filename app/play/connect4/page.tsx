"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome, RecapRow } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import {
  connect4,
  winner,
  type Connect4Move,
  type Connect4State,
  type Disc,
} from "@/lib/games/connect4";

const ROWS = 6;
const COLS = 7;

function emptyGrid(): Disc[][] {
  return Array.from({ length: ROWS }, () => Array<Disc>(COLS).fill(null));
}

function dropDisc(grid: Disc[][], col: number, disc: Disc): Disc[][] {
  const next = grid.map((row) => [...row]);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (next[r][col] === null) {
      next[r][col] = disc;
      break;
    }
  }
  return next;
}

function toOutcome(w: "R" | "Y" | "draw"): Outcome {
  return w === "R" ? "win" : w === "Y" ? "loss" : "draw";
}

/** Same scan as the engine's `winner`, but reports the shape of the winning four. */
function decidedBy(grid: Disc[][]): string {
  const directions: [number, number, string][] = [
    [0, 1, "Horizontal four"],
    [1, 0, "Vertical four"],
    [1, 1, "Diagonal four"],
    [1, -1, "Diagonal four"],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const disc = grid[r][c];
      if (!disc) continue;
      for (const [dr, dc, label] of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
          const rr = r + dr * step;
          const cc = c + dc * step;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || grid[rr][cc] !== disc) break;
          count++;
        }
        if (count === 4) return label;
      }
    }
  }
  return "Draw — board full";
}

export default function Connect4Page() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const [grid, setGrid] = useState<Disc[][]>(emptyGrid());
  const [thinking, setThinking] = useState(false);
  const [trashTalk, setTrashTalk] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const { stats, startHumanTurn, endHumanTurn, recordClaudeMove, resetStats } =
    useMatchStats();

  useEffect(() => {
    startHumanTurn();
  }, [startHumanTurn]);

  const rematch = useCallback(() => {
    setGrid(emptyGrid());
    setThinking(false);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setStarted(false);
    resetStats();
    startHumanTurn();
  }, [resetStats, startHumanTurn]);

  const play = useCallback(
    async (col: number) => {
      if (thinking || outcome || grid[0][col] !== null) return;
      setError(null);
      setStarted(true);
      endHumanTurn();

      const afterHuman = dropDisc(grid, col, "R");
      setGrid(afterHuman);

      const humanResult = winner(afterHuman);
      if (humanResult) {
        setOutcome(toOutcome(humanResult));
        return;
      }

      setThinking(true);
      try {
        const state: Connect4State = { grid: afterHuman };
        const r = await requestClaudeMove("connect4", state, model);
        recordClaudeMove(r);
        setTrashTalk(r.trashTalk || null);
        const move = r.move as Connect4Move;
        const afterClaude = connect4.applyClaudeMove(state, move).grid;
        setGrid(afterClaude);
        const claudeResult = winner(afterClaude);
        if (claudeResult) {
          setOutcome(toOutcome(claudeResult));
        } else {
          startHumanTurn();
        }
      } catch (e) {
        // Give the turn back so the human can retry the same move.
        setGrid(grid);
        setError(e instanceof Error ? e.message : "Something went wrong.");
        startHumanTurn();
      } finally {
        setThinking(false);
      }
    },
    [grid, thinking, outcome, model, endHumanTurn, recordClaudeMove, startHumanTurn],
  );

  const recap = useMemo<RecapRow[] | undefined>(() => {
    if (!outcome) return undefined;
    const flat = grid.flat();
    const reds = flat.filter((d) => d === "R").length;
    const yellows = flat.filter((d) => d === "Y").length;
    const openCols = grid[0].filter((d) => d === null).length;
    return [
      { label: "Decided by", value: decidedBy(grid) },
      {
        label: "Discs played",
        you: `${reds}`,
        claude: `${yellows}`,
        winner: outcome === "win" ? "you" : outcome === "loss" ? "claude" : "tie",
      },
      { label: "Board filled", value: `${reds + yellows} of ${ROWS * COLS}` },
      { label: "Columns still open", value: `${openCols} of ${COLS}` },
    ];
  }, [outcome, grid]);

  return (
    <GameShell
      title="Connect Four"
      model={model}
      onModelChange={setModel}
      modelLocked={started}
      stats={stats}
      thinking={thinking}
      trashTalk={trashTalk}
      outcome={outcome}
      onRematch={rematch}
      error={error}
      recap={recap}
    >
      <div className="grid grid-cols-7 gap-1 border-4 border-black bg-white p-3 shadow-[6px_6px_0_#000]">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            onClick={() => play(c)}
            disabled={grid[0][c] !== null || thinking}
            aria-label={`Column ${c}`}
            className={`flex flex-col items-center gap-2 border-2 border-transparent p-1 transition-colors ${
              grid[0][c] === null && !thinking
                ? "hover:border-black hover:bg-[#FF5C39]/15"
                : ""
            }`}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const cell = grid[r][c];
              return (
                <span
                  key={r}
                  className={`h-9 w-9 rounded-full border-2 border-black ${
                    cell === "R"
                      ? "bg-black"
                      : cell === "Y"
                        ? "bg-[#FF5C39]"
                        : "bg-[#F5F0E8]"
                  }`}
                />
              );
            })}
          </button>
        ))}
      </div>
      <p className="font-sans text-xs font-bold uppercase tracking-wide text-black/60">
        Your discs are black, Claude&apos;s are orange. Click a column to drop.
      </p>
    </GameShell>
  );
}
