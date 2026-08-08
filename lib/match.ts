"use client";

import { useCallback, useRef, useState } from "react";
import type { Move, MoveResponse } from "./games/types";
import type { ModelKey } from "./models";

export interface SideStats {
  moves: number;
  timeMs: number;
  costUsd: number;
  tokens: number;
}

export interface MatchStats {
  human: SideStats;
  claude: SideStats;
}

const emptySide = (): SideStats => ({ moves: 0, timeMs: 0, costUsd: 0, tokens: 0 });

export function emptyStats(): MatchStats {
  return { human: emptySide(), claude: emptySide() };
}

/**
 * Tracks the running you-vs-Claude scoreboard.
 * Call `startHumanTurn()` when it becomes the human's turn and
 * `endHumanTurn()` when they commit a move; record Claude turns with the
 * MoveResponse from the API.
 */
export function useMatchStats() {
  const [stats, setStats] = useState<MatchStats>(emptyStats());
  const humanTurnStart = useRef<number | null>(null);

  const startHumanTurn = useCallback(() => {
    humanTurnStart.current = Date.now();
  }, []);

  const endHumanTurn = useCallback(() => {
    const started = humanTurnStart.current;
    humanTurnStart.current = null;
    const elapsed = started ? Date.now() - started : 0;
    setStats((s) => ({
      ...s,
      human: {
        ...s.human,
        moves: s.human.moves + 1,
        timeMs: s.human.timeMs + elapsed,
      },
    }));
  }, []);

  const recordClaudeMove = useCallback((r: MoveResponse) => {
    setStats((s) => ({
      ...s,
      claude: {
        moves: s.claude.moves + 1,
        timeMs: s.claude.timeMs + r.stats.latencyMs,
        costUsd: s.claude.costUsd + r.stats.costUsd,
        tokens: s.claude.tokens + r.stats.inputTokens + r.stats.outputTokens,
      },
    }));
  }, []);

  const resetStats = useCallback(() => {
    humanTurnStart.current = null;
    setStats(emptyStats());
  }, []);

  return { stats, startHumanTurn, endHumanTurn, recordClaudeMove, resetStats };
}

/** Ask the server for Claude's next move. Throws Error with a friendly message. */
export async function requestClaudeMove(
  game: string,
  state: unknown,
  model: ModelKey,
): Promise<MoveResponse & { move: Move }> {
  const res = await fetch("/api/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game, state, model }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Claude move failed (${res.status})`);
  }
  return data as MoveResponse & { move: Move };
}

export function fmtSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function fmtUsd(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}
