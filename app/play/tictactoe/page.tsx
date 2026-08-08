"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import { tictactoe, winner, type Cell, type TTTMove, type TTTState } from "@/lib/games/tictactoe";

function toOutcome(w: "X" | "O" | "draw"): Outcome {
  return w === "X" ? "win" : w === "O" ? "loss" : "draw";
}

export default function TicTacToePage() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
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
    setBoard(Array(9).fill(null));
    setThinking(false);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setStarted(false);
    resetStats();
    startHumanTurn();
  }, [resetStats, startHumanTurn]);

  const play = useCallback(
    async (cell: number) => {
      if (thinking || outcome || board[cell] !== null) return;
      setError(null);
      setStarted(true);
      endHumanTurn();

      const afterHuman = [...board];
      afterHuman[cell] = "X";
      setBoard(afterHuman);

      const humanResult = winner(afterHuman);
      if (humanResult) {
        setOutcome(toOutcome(humanResult));
        return;
      }

      setThinking(true);
      try {
        const state: TTTState = { board: afterHuman };
        const r = await requestClaudeMove("tictactoe", state, model);
        recordClaudeMove(r);
        setTrashTalk(r.trashTalk || null);
        const move = r.move as TTTMove;
        const afterClaude = tictactoe.applyClaudeMove(state, move).board;
        setBoard(afterClaude);
        const claudeResult = winner(afterClaude);
        if (claudeResult) {
          setOutcome(toOutcome(claudeResult));
        } else {
          startHumanTurn();
        }
      } catch (e) {
        // Give the turn back so the human can retry the same move.
        setBoard(board);
        setError(e instanceof Error ? e.message : "Something went wrong.");
        startHumanTurn();
      } finally {
        setThinking(false);
      }
    },
    [board, thinking, outcome, model, endHumanTurn, recordClaudeMove, startHumanTurn],
  );

  return (
    <GameShell
      title="Tic-Tac-Toe"
      model={model}
      onModelChange={setModel}
      modelLocked={started}
      stats={stats}
      thinking={thinking}
      trashTalk={trashTalk}
      outcome={outcome}
      onRematch={rematch}
      error={error}
    >
      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            disabled={cell !== null || thinking}
            aria-label={`Cell ${Math.floor(i / 3)},${i % 3}`}
            className={`flex h-24 w-24 items-center justify-center border-3 border-black bg-white text-4xl uppercase leading-none shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 ${
              cell === null && !thinking
                ? "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                : ""
            } ${cell === "X" ? "text-black" : "text-[#FF5C39]"}`}
          >
            {cell}
          </button>
        ))}
      </div>
      <p className="font-sans text-xs font-bold uppercase tracking-wide text-black/60">
        You are X. Click a square to move.
      </p>
    </GameShell>
  );
}
