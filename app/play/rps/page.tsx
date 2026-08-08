"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import {
  roundWinner,
  tally,
  WIN_TARGET,
  type RPSMove,
  type RPSRound,
  type RPSThrow,
} from "@/lib/games/rps";

const THROWS: { value: RPSThrow; emoji: string; label: string }[] = [
  { value: "rock", emoji: "🪨", label: "Rock" },
  { value: "paper", emoji: "📄", label: "Paper" },
  { value: "scissors", emoji: "✂️", label: "Scissors" },
];

const emojiFor = (t: RPSThrow) => THROWS.find((x) => x.value === t)!.emoji;

export default function RPSPage() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const [rounds, setRounds] = useState<RPSRound[]>([]);
  const [reveal, setReveal] = useState<RPSRound | null>(null);
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
    setRounds([]);
    setReveal(null);
    setThinking(false);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setStarted(false);
    resetStats();
    startHumanTurn();
  }, [resetStats, startHumanTurn]);

  const play = useCallback(
    async (humanThrow: RPSThrow) => {
      if (thinking || outcome) return;
      setError(null);
      setStarted(true);
      setReveal(null);
      endHumanTurn();

      setThinking(true);
      try {
        // Only the history of already-completed rounds is sent — Claude
        // never sees this round's human throw, so the reveal is fair.
        const r = await requestClaudeMove("rps", { rounds }, model);
        recordClaudeMove(r);
        setTrashTalk(r.trashTalk || null);
        const move = r.move as RPSMove;
        const claudeThrow = move.throw;

        const round: RPSRound = { human: humanThrow, claude: claudeThrow };
        setReveal(round);
        const nextRounds = [...rounds, round];
        setRounds(nextRounds);

        const { human, claude } = tally(nextRounds);
        if (human >= WIN_TARGET) {
          setOutcome("win");
        } else if (claude >= WIN_TARGET) {
          setOutcome("loss");
        } else {
          startHumanTurn();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        startHumanTurn();
      } finally {
        setThinking(false);
      }
    },
    [rounds, thinking, outcome, model, endHumanTurn, recordClaudeMove, startHumanTurn],
  );

  const { human: humanWins, claude: claudeWins } = tally(rounds);

  const resultLine = (() => {
    if (!reveal) return null;
    const w = roundWinner(reveal);
    if (w === "tie") return "Tie — replay";
    return w === "human" ? "You win the round!" : "Claude takes it.";
  })();

  return (
    <GameShell
      title="Rock-Paper-Scissors"
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
      <div className="flex flex-col items-center gap-6">
        <p className="text-sm font-medium text-muted">
          You {humanWins} — {claudeWins} Claude, first to {WIN_TARGET}
        </p>

        <div className="flex min-h-32 w-full max-w-md items-center justify-center gap-8 rounded-2xl border border-border bg-white/40 px-6 py-6">
          {thinking ? (
            <p className="text-sm text-muted">Claude is thinking…</p>
          ) : reveal ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl">{emojiFor(reveal.human)}</span>
                <span className="text-xs text-muted">You</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-semibold">vs</span>
                <span className="text-sm font-medium">{resultLine}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl">{emojiFor(reveal.claude)}</span>
                <span className="text-xs text-muted">Claude</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Pick your throw to start round 1.</p>
          )}
        </div>

        <div className="flex gap-4">
          {THROWS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => play(value)}
              disabled={thinking || outcome !== null}
              aria-label={label}
              className={`flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-white/40 text-4xl transition-colors ${
                !thinking && !outcome ? "hover:border-accent hover:bg-white/70" : ""
              }`}
            >
              <span>{emoji}</span>
              <span className="text-xs font-medium text-muted">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
