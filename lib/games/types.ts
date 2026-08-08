/**
 * Shared game-engine contract.
 *
 * Engines are pure TypeScript modules usable from both client components
 * (to apply the human's moves and render the board) and the server move
 * route (to validate and apply Claude's moves). Keep them free of React,
 * Node APIs, and randomness that must agree across client/server.
 *
 * The full game state travels client -> server on every Claude turn, so
 * state must be plain JSON. `renderForClaude` is the only view of the
 * state Claude sees — for hidden-information games (Battleship, Wordle)
 * it must omit the secrets.
 */

// Moves are game-specific JSON objects; engines cast internally.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Move = any;

export interface GameEngine<S = unknown> {
  /** URL slug + registry key, e.g. "tictactoe" */
  id: string;
  name: string;

  /** System prompt for Claude's move requests. Tone: playful, competitive. */
  systemPrompt: string;

  /**
   * JSON schema `properties` for the make_move tool (trash_talk is added
   * automatically by the route). List every property in `required`.
   */
  moveProperties: Record<string, unknown>;
  moveRequired: string[];

  /** Cast/verify a client-supplied state. Throw with a message if invalid. */
  parseState(raw: unknown): S;

  /** Return an error string if the move is illegal for Claude right now, else null. */
  validateMove(state: S, move: Move): string | null;

  /** Apply Claude's move, returning the new state. Must not mutate. */
  applyClaudeMove(state: S, move: Move): S;

  /** Text rendering of the state for Claude — hide any secret info. */
  renderForClaude(state: S): string;

  /** A guaranteed-legal move used if Claude fails twice. Deterministic preferred. */
  fallbackMove(state: S): Move;
}

export interface MoveResponse {
  move: Move;
  trashTalk: string;
  /** True if Claude failed validation and a fallback move was substituted. */
  fallback: boolean;
  stats: {
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    model: string;
    modelLabel: string;
  };
}
