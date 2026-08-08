"use client";

import { useCallback, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import type { TriviaMove, TriviaState } from "@/lib/games/trivia";
import { BAY_AREA_QUESTIONS } from "@/lib/games/trivia-bayarea";

const ROUND_LENGTH = 10;

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Category {
  key: string;
  label: string;
  blurb: string;
  /** Open Trivia Database category id, or null for the curated local set. */
  otdbId: number | null;
}

const CATEGORIES: Category[] = [
  { key: "movies", label: "Movies", blurb: "Film buffs only", otdbId: 11 },
  { key: "history", label: "History", blurb: "Dates and dynasties", otdbId: 23 },
  { key: "math", label: "Math", blurb: "Numbers, no calculator", otdbId: 19 },
  { key: "bayarea", label: "Bay Area", blurb: "Fog, bridges, ballparks", otdbId: null },
];

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** OpenTDB's url3986 encoding; fall back to the raw string if it's malformed. */
function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

interface OpenTdbResult {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

async function fetchQuestions(category: Category): Promise<Question[]> {
  if (category.otdbId === null) {
    return shuffle(BAY_AREA_QUESTIONS).slice(0, ROUND_LENGTH);
  }

  const res = await fetch(
    `https://opentdb.com/api.php?amount=${ROUND_LENGTH}&type=multiple&encode=url3986&category=${category.otdbId}`,
  );
  if (!res.ok) {
    throw new Error(`Could not reach the trivia database (${res.status}).`);
  }
  const data = (await res.json()) as {
    response_code?: number;
    results?: OpenTdbResult[];
  };
  if (data.response_code !== 0 || !data.results?.length) {
    throw new Error("The trivia database had no questions for that category.");
  }

  return data.results.map((r) => {
    const correct = decode(r.correct_answer);
    const options = shuffle([correct, ...r.incorrect_answers.map(decode)]);
    return { question: decode(r.question), options, correctIndex: options.indexOf(correct) };
  });
}

export default function TriviaPage() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [humanPick, setHumanPick] = useState<number | null>(null);
  const [claudePick, setClaudePick] = useState<number | null>(null);
  const [humanScore, setHumanScore] = useState(0);
  const [claudeScore, setClaudeScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [trashTalk, setTrashTalk] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { stats, startHumanTurn, endHumanTurn, recordClaudeMove, resetStats } =
    useMatchStats();

  const current: Question | undefined = questions[index];
  const revealed = claudePick !== null;

  const askClaude = useCallback(
    async (question: Question, cat: Category, pick: number) => {
      setThinking(true);
      setError(null);
      try {
        const state: TriviaState = {
          question: question.question,
          options: question.options,
          category: cat.label,
        };
        const r = await requestClaudeMove("trivia", state, model);
        recordClaudeMove(r);
        setTrashTalk(r.trashTalk || null);
        const answer = (r.move as TriviaMove).answer_index;
        setClaudePick(answer);
        if (pick === question.correctIndex) setHumanScore((s) => s + 1);
        if (answer === question.correctIndex) setClaudeScore((s) => s + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setThinking(false);
      }
    },
    [model, recordClaudeMove],
  );

  const answer = useCallback(
    (pick: number) => {
      if (!current || !category || revealed || thinking || humanPick !== null) return;
      endHumanTurn();
      setHumanPick(pick);
      void askClaude(current, category, pick);
    },
    [current, category, revealed, thinking, humanPick, endHumanTurn, askClaude],
  );

  const retryClaude = useCallback(() => {
    if (!current || !category || humanPick === null || thinking) return;
    void askClaude(current, category, humanPick);
  }, [current, category, humanPick, thinking, askClaude]);

  const nextQuestion = useCallback(() => {
    if (!revealed) return;
    const next = index + 1;
    if (next >= questions.length) {
      setOutcome(
        humanScore > claudeScore ? "win" : humanScore < claudeScore ? "loss" : "draw",
      );
      return;
    }
    setIndex(next);
    setHumanPick(null);
    setClaudePick(null);
    setTrashTalk(null);
    setError(null);
    startHumanTurn();
  }, [revealed, index, questions.length, humanScore, claudeScore, startHumanTurn]);

  const startCategory = useCallback(
    async (cat: Category) => {
      setLoading(true);
      setError(null);
      try {
        const qs = await fetchQuestions(cat);
        setQuestions(qs);
        setCategory(cat);
        setIndex(0);
        setHumanPick(null);
        setClaudePick(null);
        setHumanScore(0);
        setClaudeScore(0);
        setTrashTalk(null);
        startHumanTurn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load questions.");
      } finally {
        setLoading(false);
      }
    },
    [startHumanTurn],
  );

  const rematch = useCallback(() => {
    setCategory(null);
    setQuestions([]);
    setIndex(0);
    setHumanPick(null);
    setClaudePick(null);
    setHumanScore(0);
    setClaudeScore(0);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setThinking(false);
    resetStats();
  }, [resetStats]);

  return (
    <GameShell
      title="Trivia"
      model={model}
      onModelChange={setModel}
      modelLocked={category !== null}
      stats={stats}
      thinking={thinking}
      trashTalk={trashTalk}
      outcome={outcome}
      onRematch={rematch}
      error={error}
    >
      {!category || !current ? (
        <div className="flex w-full max-w-md flex-col gap-4">
          <p className="text-center text-sm text-muted">
            Pick a category. Ten questions, you against Claude.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => startCategory(c)}
                disabled={loading}
                className="flex h-28 flex-col items-start justify-end rounded-3xl border border-border bg-white/40 p-4 text-left transition-colors hover:border-accent hover:bg-white/70 disabled:opacity-50"
              >
                <span className="text-lg font-semibold tracking-tight">{c.label}</span>
                <span className="text-xs text-muted">{c.blurb}</span>
              </button>
            ))}
          </div>
          {loading && (
            <p className="text-center text-sm text-muted">Loading questions…</p>
          )}
          {error && !loading && (
            <button
              onClick={rematch}
              className="self-center rounded-full border border-border px-6 py-2 text-sm font-medium hover:border-accent"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Question {index + 1} / {questions.length}
            </span>
            <span className="font-medium">
              You {humanScore} — {claudeScore} Claude
            </span>
          </div>

          <div className="rounded-3xl border border-border bg-white/60 p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{category.label}</p>
            <p className="mt-2 text-lg font-medium leading-snug">{current.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {current.options.map((option, i) => {
              const isCorrect = i === current.correctIndex;
              const youPicked = humanPick === i;
              const claudePicked = claudePick === i;

              let tone = "border-border bg-white/40";
              if (revealed && isCorrect) {
                tone = "border-emerald-600 bg-emerald-50";
              } else if (revealed && (youPicked || claudePicked)) {
                tone = "border-red-400 bg-red-50";
              } else if (youPicked) {
                tone = "border-accent bg-white/70";
              }

              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={humanPick !== null || thinking}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${tone} ${
                    humanPick === null && !thinking ? "hover:border-accent hover:bg-white/70" : ""
                  }`}
                >
                  <span>{option}</span>
                  <span className="flex shrink-0 gap-1 text-xs font-medium">
                    {youPicked && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                        You
                      </span>
                    )}
                    {claudePicked && (
                      <span className="rounded-full border border-border bg-white/70 px-2 py-0.5">
                        Claude
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {thinking && <p className="text-center text-sm text-muted">Claude is answering…</p>}

          {!thinking && humanPick !== null && !revealed && (
            <button
              onClick={retryClaude}
              className="self-center rounded-full border border-border px-6 py-2 text-sm font-medium hover:border-accent"
            >
              Ask Claude again
            </button>
          )}

          {revealed && (
            <button
              onClick={nextQuestion}
              className="self-center rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {index + 1 >= questions.length ? "See results" : "Next question"}
            </button>
          )}

          <p className="text-xs text-muted">
            You answer first; Claude gets the same question, unseen.
          </p>
        </div>
      )}
    </GameShell>
  );
}
