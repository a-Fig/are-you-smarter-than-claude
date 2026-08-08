import type { GameEngine } from "./types";

/**
 * Human and Claude race to guess the same secret 5-letter word on separate
 * boards, up to 6 guesses each. The secret is picked and held client-side
 * only — it must NEVER be sent to the server. State carries Claude's own
 * board (its guesses + the feedback for each), which is all Claude needs
 * to deduce its next guess.
 */
export interface WordleState {
  /** Claude's guesses so far, lowercase, 5 letters each. */
  guesses: string[];
  /** Feedback string per guess, same length/order as `guesses`. */
  feedback: string[];
}

export interface WordleMove {
  guess: string;
}

const WORD_LEN = 5;
const MAX_GUESSES = 6;
const STARTER_WORDS = ["crane", "slate", "pious", "dumpy"];

/**
 * Score a guess against the secret, Wordle-style.
 * "G" = correct letter, correct spot. "Y" = letter is in the word, wrong
 * spot. "-" = letter absent (accounting for duplicates already matched).
 * Greens are resolved first and consume one copy of that letter from the
 * secret's pool; leftover letters are then matched left-to-right for
 * yellows, capped by how many of that letter remain in the secret.
 */
export function scoreGuess(guess: string, secret: string): string {
  const g = guess.toLowerCase();
  const s = secret.toLowerCase();
  const result: string[] = new Array(WORD_LEN).fill("-");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORD_LEN; i++) {
    if (g[i] === s[i]) {
      result[i] = "G";
    } else {
      remaining[s[i]] = (remaining[s[i]] ?? 0) + 1;
    }
  }

  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "G") continue;
    const letter = g[i];
    if (remaining[letter] > 0) {
      result[i] = "Y";
      remaining[letter]--;
    }
  }

  return result.join("");
}

function isSolved(feedback: string): boolean {
  return feedback === "GGGGG";
}

const LETTER_RE = /^[a-z]{5}$/;

export const wordle: GameEngine<WordleState> = {
  id: "wordle",
  name: "Wordle Race",

  systemPrompt:
    "You are an expert Wordle player racing a human on the site " +
    '"Are You Smarter Than Claude?". You are both guessing the same hidden ' +
    "5-letter word on separate boards, up to 6 guesses each — you can't see " +
    "the human's board or guesses. Reason carefully about letter frequency " +
    "and which letters/positions are still consistent with all your feedback " +
    "so far; never repeat information you already know is wrong. Along with " +
    "your guess, include one short line of playful, PG trash talk (under 15 " +
    "words). Be a cheeky but good-natured opponent.",

  moveProperties: {
    guess: {
      type: "string",
      description: "Your next 5-letter guess, lowercase letters only.",
    },
  },
  moveRequired: ["guess"],

  parseState(raw: unknown): WordleState {
    const s = raw as WordleState;
    if (
      !s ||
      !Array.isArray(s.guesses) ||
      !Array.isArray(s.feedback) ||
      s.guesses.length !== s.feedback.length ||
      s.guesses.length > MAX_GUESSES ||
      !s.guesses.every((g) => typeof g === "string" && LETTER_RE.test(g)) ||
      !s.feedback.every((f) => typeof f === "string")
    ) {
      throw new Error("Invalid Wordle state");
    }
    return { guesses: [...s.guesses], feedback: [...s.feedback] };
  },

  validateMove(state, move: WordleMove) {
    const guess = move?.guess;
    if (typeof guess !== "string" || !LETTER_RE.test(guess.toLowerCase())) {
      return "Guess must be exactly 5 letters (a-z).";
    }
    if (state.guesses.length >= MAX_GUESSES) {
      return "No guesses remaining.";
    }
    if (state.feedback.some(isSolved)) {
      return "The game is already over.";
    }
    if (state.guesses.includes(guess.toLowerCase())) {
      return "You already guessed that word.";
    }
    return null;
  },

  // NOTE: the server has no access to the secret word, so it cannot score
  // Claude's guess here. It appends the guess with an empty feedback
  // placeholder; the CLIENT (which knows the secret) recomputes the real
  // feedback via `scoreGuess` right after receiving this move and stores
  // that back into state before the next request.
  applyClaudeMove(state, move: WordleMove) {
    return {
      guesses: [...state.guesses, move.guess.toLowerCase()],
      feedback: [...state.feedback, ""],
    };
  },

  renderForClaude(state) {
    if (state.guesses.length === 0) {
      return (
        "You are racing a human to guess a hidden 5-letter English word. " +
        "This is your opening guess — no information yet. Pick a strong " +
        "starting word covering common letters."
      );
    }

    const lines = state.guesses.map((guess, i) => {
      const fb = state.feedback[i];
      const letters = guess
        .toUpperCase()
        .split("")
        .map((ch, j) => {
          const mark = fb[j];
          const tag = mark === "G" ? "green" : mark === "Y" ? "yellow" : "gray";
          return `${ch}[${tag}]`;
        })
        .join(" ");
      return `Guess ${i + 1}: ${letters}`;
    });

    return (
      "Your guesses so far and their feedback (green = correct letter & " +
      "spot, yellow = letter is in the word but wrong spot, gray = letter " +
      "is absent — unless another copy of that letter is elsewhere marked " +
      "green/yellow, in which case only the extra copies are absent):\n\n" +
      lines.join("\n") +
      `\n\nYou have used ${state.guesses.length} of ${MAX_GUESSES} guesses. ` +
      "Make your best next guess."
    );
  },

  fallbackMove(state): WordleMove {
    const used = new Set(state.guesses);
    const word = STARTER_WORDS.find((w) => !used.has(w)) ?? "flint";
    return { guess: word };
  },
};
