import type { GameEngine } from "./types";

/** Best-of-7 Rock-Paper-Scissors. First to 4 round wins; ties don't score. */
export type RPSThrow = "rock" | "paper" | "scissors";

export interface RPSRound {
  human: RPSThrow;
  claude: RPSThrow;
}

/**
 * State is the history of COMPLETED rounds only. The human's in-flight pick
 * for the current round is deliberately never included here — it lives only
 * in client state until Claude has independently committed a move, which is
 * what keeps the reveal simultaneous instead of letting Claude peek.
 */
export interface RPSState {
  rounds: RPSRound[];
}

export interface RPSMove {
  throw: RPSThrow;
}

export const WIN_TARGET = 4;

const THROWS: RPSThrow[] = ["rock", "paper", "scissors"];

function isThrow(v: unknown): v is RPSThrow {
  return v === "rock" || v === "paper" || v === "scissors";
}

/** True if `a` beats `b`. */
export function beats(a: RPSThrow, b: RPSThrow): boolean {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "scissors" && b === "paper") ||
    (a === "paper" && b === "rock")
  );
}

export function roundWinner(round: RPSRound): "human" | "claude" | "tie" {
  if (round.human === round.claude) return "tie";
  return beats(round.human, round.claude) ? "human" : "claude";
}

/** Round-win tally, excluding ties. */
export function tally(rounds: RPSRound[]): { human: number; claude: number } {
  let human = 0;
  let claude = 0;
  for (const r of rounds) {
    const w = roundWinner(r);
    if (w === "human") human++;
    else if (w === "claude") claude++;
  }
  return { human, claude };
}

/** Who has clinched the match, if anyone. */
export function matchWinner(rounds: RPSRound[]): "human" | "claude" | null {
  const { human, claude } = tally(rounds);
  if (human >= WIN_TARGET) return "human";
  if (claude >= WIN_TARGET) return "claude";
  return null;
}

export const rps: GameEngine<RPSState> = {
  id: "rps",
  name: "Rock-Paper-Scissors",

  systemPrompt:
    "You are playing best-of-7 Rock-Paper-Scissors (first to 4 round wins; " +
    'ties don\'t count) against a human on the site "Are You Smarter Than ' +
    'Claude?". You are only ever shown the history of completed rounds — ' +
    "never the human's current throw — so the reveal is genuinely " +
    "simultaneous. That history is your edge: humans are predictable. Look " +
    "for patterns (favorite throws, repeats, cycles, win-stay/lose-shift " +
    "habits, reactions to being beaten) and exploit them when picking your " +
    "throw. Along with your move, include one short line of playful, PG " +
    "trash talk (under 15 words).",

  moveProperties: {
    throw: {
      type: "string",
      enum: ["rock", "paper", "scissors"],
      description: "Your throw for this round.",
    },
  },
  moveRequired: ["throw"],

  parseState(raw: unknown): RPSState {
    const s = raw as RPSState;
    if (
      !s ||
      !Array.isArray(s.rounds) ||
      !s.rounds.every(
        (r) => r && isThrow(r.human) && isThrow(r.claude),
      )
    ) {
      throw new Error("Invalid rock-paper-scissors state");
    }
    return { rounds: s.rounds.map((r) => ({ human: r.human, claude: r.claude })) };
  },

  validateMove(state, move: RPSMove) {
    if (!isThrow(move?.throw)) {
      return 'Move must have a throw of "rock", "paper", or "scissors".';
    }
    if (matchWinner(state.rounds)) return "The match is already decided.";
    return null;
  },

  // The completed round can't be constructed here: the human's current
  // throw is intentionally withheld from state (see RPSState) to preserve
  // simultaneous-reveal integrity, so this engine has nothing to add it to
  // yet. The client already knows both throws once Claude responds, so it
  // appends the finished round to `rounds` itself before the next request.
  applyClaudeMove(state) {
    return state;
  },

  renderForClaude(state) {
    const { rounds } = state;
    const { human, claude } = tally(rounds);

    const history = rounds.length
      ? rounds
          .map((r, i) => {
            const w = roundWinner(r);
            const outcome =
              w === "tie" ? "tie" : w === "claude" ? "you won" : "you lost";
            return `Round ${i + 1}: human threw ${r.human}, you threw ${r.claude} — ${outcome}`;
          })
          .join("\n")
      : "No rounds have been played yet.";

    return (
      `Best-of-7 Rock-Paper-Scissors. First to ${WIN_TARGET} round wins ` +
      "(ties don't count) takes the match.\n\n" +
      `${history}\n\n` +
      `Current score: you ${claude} — ${human} human.\n\n` +
      "Study the human's throws above for any exploitable pattern, then " +
      `make your throw for round ${rounds.length + 1}.`
    );
  },

  fallbackMove(state): RPSMove {
    return { throw: THROWS[state.rounds.length % THROWS.length] };
  },
};
