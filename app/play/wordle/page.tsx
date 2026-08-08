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
    "flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-semibold uppercase sm:h-12 sm:w-12";
  let colors = "border-border bg-white/40 text-foreground";
  if (mark === "G") colors = "border-green-600 bg-green-600 text-white";
  else if (mark === "Y") colors = "border-amber-500 bg-amber-500 text-white";
  else if (mark === "-") colors = "border-border bg-neutral-300 text-white";
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
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">You</span>
            <Board guesses={humanGuesses} feedback={humanFeedback} revealed />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Claude</span>
            <Board guesses={claudeGuesses} feedback={claudeFeedback} revealed={!!outcome} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitGuess();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            maxLength={5}
            disabled={thinking || !!outcome || guessesLeft <= 0}
            onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, "").toLowerCase())}
            placeholder="guess"
            autoFocus
            className="w-32 rounded-full border border-border bg-white/60 px-4 py-2 text-center text-lg font-medium uppercase tracking-widest outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={thinking || !!outcome || input.length !== 5}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Guess
          </button>
        </form>
        <p className="text-xs text-muted">
          Guess the secret 5-letter word before Claude does. {guessesLeft} guess
          {guessesLeft === 1 ? "" : "es"} left.
        </p>
      </GameShell>
      {outcome && (
        <p className="pb-10 text-center text-sm text-muted">
          The word was <span className="font-semibold text-foreground">{secret.toUpperCase()}</span>.
        </p>
      )}
    </>
  );
}
