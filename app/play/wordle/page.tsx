"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import { scoreGuess, type WordleMove, type WordleState } from "@/lib/games/wordle";
import { ANSWERS } from "@/lib/games/wordle-words";

const MAX_GUESSES = 6;

function randomSecret(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

function Tile({ letter, mark, revealed }: { letter: string; mark?: string; revealed: boolean }) {
  const base =
    "flex h-11 w-11 items-center justify-center border-2 border-black text-lg uppercase sm:h-12 sm:w-12";
  let colors = "bg-white text-black";
  if (mark === "G") colors = "bg-green-600 text-white";
  else if (mark === "Y") colors = "bg-amber-400 text-black";
  else if (mark === "-") colors = "bg-neutral-400 text-white";
  return <div className={`${base} ${colors}`}>{revealed ? letter : ""}</div>;
}

function Board({
  guesses,
  feedback,
  revealed,
}: {
  guesses: string[];
  feedback: string[];
  revealed: boolean;
}) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    const guess = guesses[i];
    const fb = feedback[i];
    const cells = Array.from({ length: 5 }, (_, j) => (
      <Tile key={j} letter={guess ? guess[j] : ""} mark={guess ? fb[j] : undefined} revealed={revealed} />
    ));
    return (
      <div key={i} className="flex gap-1.5">
        {cells}
      </div>
    );
  });
  return <div className="flex flex-col gap-1.5">{rows}</div>;
}

function toOutcome(humanSolved: boolean, claudeSolved: boolean): Outcome {
  if (humanSolved && claudeSolved) return "draw";
  if (humanSolved) return "win";
  if (claudeSolved) return "loss";
  return "draw";
}

export default function WordlePage() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const [secret, setSecret] = useState(() => randomSecret());
  const [humanGuesses, setHumanGuesses] = useState<string[]>([]);
  const [humanFeedback, setHumanFeedback] = useState<string[]>([]);
  const [claudeGuesses, setClaudeGuesses] = useState<string[]>([]);
  const [claudeFeedback, setClaudeFeedback] = useState<string[]>([]);
  const [input, setInput] = useState("");
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
    setSecret(randomSecret());
    setHumanGuesses([]);
    setHumanFeedback([]);
    setClaudeGuesses([]);
    setClaudeFeedback([]);
    setInput("");
    setThinking(false);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setStarted(false);
    resetStats();
    startHumanTurn();
  }, [resetStats, startHumanTurn]);

  const submitGuess = useCallback(async () => {
    if (thinking || outcome) return;
    const guess = input.trim().toLowerCase();
    if (!/^[a-z]{5}$/.test(guess)) {
      setError("Enter a 5-letter word.");
      return;
    }
    if (humanGuesses.includes(guess)) {
      setError("You already guessed that word.");
      return;
    }
    if (humanGuesses.length >= MAX_GUESSES) return;

    setError(null);
    setStarted(true);
    endHumanTurn();

    const humanFb = scoreGuess(guess, secret);
    const nextHumanGuesses = [...humanGuesses, guess];
    const nextHumanFeedback = [...humanFeedback, humanFb];
    setHumanGuesses(nextHumanGuesses);
    setHumanFeedback(nextHumanFeedback);
    setInput("");

    setThinking(true);
    try {
      // Claude only ever sees its own board — never the human's guesses or the secret.
      const claudeState: WordleState = { guesses: claudeGuesses, feedback: claudeFeedback };
      const r = await requestClaudeMove("wordle", claudeState, model);
      recordClaudeMove(r);
      setTrashTalk(r.trashTalk || null);
      const move = r.move as WordleMove;
      const claudeGuess = move.guess.toLowerCase();
      const claudeFb = scoreGuess(claudeGuess, secret);
      setClaudeGuesses((g) => [...g, claudeGuess]);
      setClaudeFeedback((f) => [...f, claudeFb]);

      const humanSolved = humanFb === "GGGGG";
      const claudeSolved = claudeFb === "GGGGG";
      if (humanSolved || claudeSolved) {
        setOutcome(toOutcome(humanSolved, claudeSolved));
      } else if (nextHumanGuesses.length >= MAX_GUESSES) {
        setOutcome("draw");
      } else {
        startHumanTurn();
      }
    } catch (e) {
      // Roll back the human's guess so they can retry it.
      setHumanGuesses(humanGuesses);
      setHumanFeedback(humanFeedback);
      setInput(guess);
      setError(e instanceof Error ? e.message : "Something went wrong.");
      startHumanTurn();
    } finally {
      setThinking(false);
    }
  }, [
    thinking,
    outcome,
    input,
    humanGuesses,
    humanFeedback,
    claudeGuesses,
    claudeFeedback,
    secret,
    model,
    endHumanTurn,
    recordClaudeMove,
    startHumanTurn,
  ]);

  const guessesLeft = MAX_GUESSES - humanGuesses.length;

  return (
    <>
      <GameShell
        title="Wordle Race"
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
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="border-2 border-black bg-white px-3 py-0.5 text-xs uppercase tracking-[0.2em] shadow-[3px_3px_0_#000]">
              You
            </span>
            <Board guesses={humanGuesses} feedback={humanFeedback} revealed />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="border-2 border-black bg-white px-3 py-0.5 text-xs uppercase tracking-[0.2em] shadow-[3px_3px_0_#000]">
              Claude
            </span>
            <Board guesses={claudeGuesses} feedback={claudeFeedback} revealed={!!outcome} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitGuess();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            maxLength={5}
            disabled={thinking || !!outcome || guessesLeft <= 0}
            onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, "").toLowerCase())}
            placeholder="guess"
            autoFocus
            className="w-36 border-3 border-black bg-white px-4 py-2 text-center text-lg uppercase tracking-widest text-black shadow-[3px_3px_0_#000] outline-none placeholder:text-black/30 focus:border-black disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={thinking || !!outcome || input.length !== 5}
            className="border-3 border-black bg-[#FF5C39] px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-[4px_4px_0_#000]"
          >
            Guess
          </button>
        </form>
        <p className="font-sans text-xs font-bold text-black/60">
          Guess the secret 5-letter word before Claude does. {guessesLeft} guess
          {guessesLeft === 1 ? "" : "es"} left.
        </p>
      </GameShell>
      {outcome && (
        <div className="flex justify-center bg-[#F5F0E8] pb-10">
          <p className="border-2 border-black bg-white px-4 py-2 text-center font-sans text-sm font-bold text-black shadow-[3px_3px_0_#000]">
            The word was{" "}
            <span className="border-2 border-black bg-[#FF5C39] px-1.5 uppercase">
              {secret.toUpperCase()}
            </span>
            .
          </p>
        </div>
      )}
    </>
  );
}
