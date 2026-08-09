"use client";

import { useCallback, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome, RecapRow } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import type { TriviaMove, TriviaState } from "@/lib/games/trivia";
import { BAY_AREA_QUESTIONS } from "@/lib/games/trivia-bayarea";
import { ATLA_QUESTIONS } from "@/lib/games/trivia-atla";
import { STAR_WARS_QUESTIONS } from "@/lib/games/trivia-starwars";
import { MARVEL_QUESTIONS } from "@/lib/games/trivia-marvel";
import { ANIME_QUESTIONS } from "@/lib/games/trivia-anime";
import { EARTH_2026_QUESTIONS } from "@/lib/games/trivia-2026";

const ROUND_LENGTH = 10;

/** Who got a given question right, recorded once the round is revealed. */
interface QuestionResult {
  you: boolean;
  claude: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Category {
  key: string;
  label: string;
  blurb: string;
  /** Curated local question bank; when absent, `otdbId` names the Open Trivia Database category. */
  local?: Question[];
  otdbId: number | null;
}

const CATEGORIES: Category[] = [
  { key: "atla", label: "ATLA", blurb: "Yip yip, superfans", local: ATLA_QUESTIONS, otdbId: null },
  { key: "starwars", label: "Star Wars", blurb: "A galaxy far, far away", local: STAR_WARS_QUESTIONS, otdbId: null },
  { key: "marvel", label: "Marvel", blurb: "Mostly MCU", local: MARVEL_QUESTIONS, otdbId: null },
  { key: "anime", label: "Anime", blurb: "Major titles only", local: ANIME_QUESTIONS, otdbId: null },
  { key: "earth2026", label: "Earth in 2026", blurb: "Been reading the news?", local: EARTH_2026_QUESTIONS, otdbId: null },
  { key: "history", label: "History", blurb: "Dates and dynasties", otdbId: 23 },
  { key: "math", label: "Math", blurb: "Numbers, no calculator", otdbId: 19 },
  { key: "bayarea", label: "Bay Area", blurb: "Fog, bridges, ballparks", local: BAY_AREA_QUESTIONS, otdbId: null },
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
  if (category.local || category.otdbId === null) {
    return shuffle(category.local ?? []).slice(0, ROUND_LENGTH);
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
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [trashTalk, setTrashTalk] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { stats, startHumanTurn, endHumanTurn, recordClaudeMove, resetStats } =
    useMatchStats();

  const current: Question | undefined = questions[index];
  const revealed = claudePick !== null;
  // Scores are derived from the per-question log so the two can't drift.
  const humanScore = results.filter((r) => r.you).length;
  const claudeScore = results.filter((r) => r.claude).length;

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
        setResults((prev) => [
          ...prev,
          {
            you: pick === question.correctIndex,
            claude: answer === question.correctIndex,
          },
        ]);
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
        setResults([]);
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
    setResults([]);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setThinking(false);
    resetStats();
  }, [resetStats]);

  const recap: RecapRow[] | undefined = outcome
    ? [
        {
          label: "Final score",
          you: `${humanScore}/${results.length}`,
          claude: `${claudeScore}/${results.length}`,
          winner: outcome === "win" ? "you" : outcome === "loss" ? "claude" : "tie",
        },
        { label: "You", value: results.map((r) => (r.you ? "✓" : "✗")).join("") },
        { label: "Claude", value: results.map((r) => (r.claude ? "✓" : "✗")).join("") },
        ...(category ? [{ label: "Category", value: category.label }] : []),
      ]
    : undefined;

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
      recap={recap}
      // The player already clicks "See results" after the last reveal, so the
      // board has been seen — no extra hold before the result card.
      revealDelayMs={0}
    >
      {!category || !current ? (
        <div className="flex w-full max-w-md flex-col gap-5">
          <p className="text-center font-sans text-sm font-medium uppercase tracking-wide text-black/70">
            Pick a category. Ten questions, you against Claude.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => startCategory(c)}
                disabled={loading}
                className="flex h-28 flex-col items-start justify-end gap-1 border-4 border-black bg-white p-4 text-left shadow-[6px_6px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none disabled:opacity-50"
              >
                <span className="text-lg uppercase leading-tight">{c.label}</span>
                <span className="font-sans text-xs font-medium text-black/60">{c.blurb}</span>
              </button>
            ))}
          </div>
          {loading && (
            <p className="text-center font-sans text-sm font-bold uppercase tracking-wide text-black/60">
              Loading questions…
            </p>
          )}
          {error && !loading && (
            <button
              onClick={rematch}
              className="self-center border-3 border-black bg-white px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wide sm:text-xs">
            <span className="text-black/60">
              Question {index + 1} / {questions.length}
            </span>
            <span>
              You {humanScore} — {claudeScore} Claude
            </span>
          </div>

          <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/60">
              {category.label}
            </p>
            <p className="mt-2 font-sans text-lg font-bold leading-snug">{current.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {current.options.map((option, i) => {
              const isCorrect = i === current.correctIndex;
              const youPicked = humanPick === i;
              const claudePicked = claudePick === i;

              let tone = "bg-white";
              if (revealed && isCorrect) {
                tone = "bg-green-600 text-white";
              } else if (revealed && (youPicked || claudePicked)) {
                tone = "bg-[#FF5C39]";
              } else if (youPicked) {
                tone = "bg-[#FF5C39]";
              }

              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={humanPick !== null || thinking}
                  className={`flex w-full items-center justify-between gap-3 border-3 border-black px-4 py-3 text-left font-sans text-sm font-bold shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 ${tone} ${
                    humanPick === null && !thinking
                      ? "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#000]"
                      : ""
                  }`}
                >
                  <span>{option}</span>
                  <span className="flex shrink-0 gap-1 text-[10px] uppercase tracking-wide">
                    {youPicked && (
                      <span className="border-2 border-black bg-[#FF5C39] px-1.5 py-0.5 text-black">
                        You
                      </span>
                    )}
                    {claudePicked && (
                      <span className="border-2 border-black bg-white px-1.5 py-0.5 text-black">
                        Claude
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {thinking && (
            <p className="text-center font-sans text-sm font-bold uppercase tracking-wide text-black/60">
              Claude is answering…
            </p>
          )}

          {!thinking && humanPick !== null && !revealed && (
            <button
              onClick={retryClaude}
              className="self-center border-3 border-black bg-white px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
            >
              Ask Claude again
            </button>
          )}

          {revealed && (
            <button
              onClick={nextQuestion}
              className="self-center border-3 border-black bg-[#FF5C39] px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              {index + 1 >= questions.length ? "See results" : "Next question"}
            </button>
          )}

          <p className="text-center font-sans text-[11px] font-medium uppercase tracking-wide text-black/60">
            You answer first; Claude gets the same question, unseen.
          </p>
        </div>
      )}
    </GameShell>
  );
}
