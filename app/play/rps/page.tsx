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
        <p className="text-xs uppercase tracking-wide sm:text-sm">
          You {humanWins} — {claudeWins} Claude, first to {WIN_TARGET}
        </p>

        <div className="flex min-h-32 w-full max-w-md items-center justify-center gap-6 border-4 border-black bg-white px-6 py-6 shadow-[6px_6px_0_#000]">
          {thinking ? (
            <p className="font-sans text-sm font-bold uppercase tracking-wide text-black/60">
              Claude is thinking…
            </p>
          ) : reveal ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl leading-none">{emojiFor(reveal.human)}</span>
                <span className="border-2 border-black bg-white px-2 py-0.5 text-[10px] uppercase tracking-wide shadow-[2px_2px_0_#000]">
                  You
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-lg uppercase">vs</span>
                <span className="font-sans text-sm font-bold uppercase leading-tight">
                  {resultLine}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl leading-none">{emojiFor(reveal.claude)}</span>
                <span className="border-2 border-black bg-[#FF5C39] px-2 py-0.5 text-[10px] uppercase tracking-wide shadow-[2px_2px_0_#000]">
                  Claude
                </span>
              </div>
            </>
          ) : (
            <p className="font-sans text-sm font-medium uppercase tracking-wide text-black/60">
              Pick your throw to start round 1.
            </p>
          )}
        </div>

        <div className="flex gap-5">
          {THROWS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => play(value)}
              disabled={thinking || outcome !== null}
              aria-label={label}
              className={`flex h-24 w-24 flex-col items-center justify-center gap-1 border-4 border-black bg-white text-4xl shadow-[6px_6px_0_#000] transition-[transform,box-shadow] duration-100 ${
                !thinking && !outcome
                  ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                  : "opacity-50"
              }`}
            >
              <span className="leading-none">{emoji}</span>
              <span className="text-[10px] uppercase tracking-wide text-black/70">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
