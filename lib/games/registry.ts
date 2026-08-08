import type { GameEngine } from "./types";
import { tictactoe } from "./tictactoe";
import { connect4 } from "./connect4";
import { wordle } from "./wordle";
import { trivia } from "./trivia";
import { battleship } from "./battleship";
import { rps } from "./rps";

// Register every game engine here. Server-only import surface for the
// move route; client pages import their engine module directly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAME_REGISTRY: Record<string, GameEngine<any>> = {
  [tictactoe.id]: tictactoe,
  [connect4.id]: connect4,
  [wordle.id]: wordle,
  [trivia.id]: trivia,
  [battleship.id]: battleship,
  [rps.id]: rps,
};
