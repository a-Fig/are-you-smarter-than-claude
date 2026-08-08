import type { GameEngine } from "./types";

/**
 * One quiz question at a time. The correct index lives only in the client's
 * question bank and is deliberately absent from this state — the state is
 * posted to the server on every turn, so including the answer would let
 * Claude read it instead of knowing it.
 */
export interface TriviaState {
  question: string;
  options: string[];
  category: string;
}

export interface TriviaMove {
  answer_index: number;
}

export const trivia: GameEngine<TriviaState> = {
  id: "trivia",
  name: "Trivia",

  systemPrompt:
    "You are playing pub trivia against a human on the site " +
    '"Are You Smarter Than Claude?". You get one multiple-choice question at ' +
    "a time and must pick the index of the correct option. Answer accurately — " +
    "reason from what you actually know, and if you are unsure pick the most " +
    "plausible option rather than guessing at random. Along with your answer, " +
    "include one short line of playful, PG trash talk (under 15 words). " +
    "Be a cheeky but good-natured opponent.",

  moveProperties: {
    answer_index: {
      type: "integer",
      enum: [0, 1, 2, 3],
      description: "Index of the option you believe is correct, 0-3",
    },
  },
  moveRequired: ["answer_index"],

  parseState(raw: unknown): TriviaState {
    const s = raw as TriviaState;
    if (
      !s ||
      typeof s.question !== "string" ||
      !s.question.trim() ||
      typeof s.category !== "string" ||
      !Array.isArray(s.options) ||
      s.options.length !== 4 ||
      !s.options.every((o) => typeof o === "string")
    ) {
      throw new Error("Invalid trivia state");
    }
    return {
      question: s.question,
      options: [...s.options],
      category: s.category,
    };
  },

  validateMove(state, move: TriviaMove) {
    if (
      !Number.isInteger(move?.answer_index) ||
      move.answer_index < 0 ||
      move.answer_index >= state.options.length
    ) {
      return `answer_index must be an integer between 0 and ${state.options.length - 1}.`;
    }
    return null;
  },

  applyClaudeMove(state) {
    // A trivia state is a single question and never mutates: scoring and
    // advancing to the next question happen client-side, where the answer key
    // lives. Return the state untouched.
    return state;
  },

  renderForClaude(state) {
    const options = state.options.map((o, i) => `${i}. ${o}`).join("\n");
    return (
      `Category: ${state.category}\n\n` +
      `Question: ${state.question}\n\n` +
      `${options}\n\n` +
      "Answer with the index of the correct option."
    );
  },

  fallbackMove(): TriviaMove {
    return { answer_index: 0 };
  },
};
