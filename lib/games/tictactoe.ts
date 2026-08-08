import type { GameEngine } from "./types";

/** Human plays X, Claude plays O. Cells are row-major, 0-8. */
export type Cell = "X" | "O" | null;

export interface TTTState {
  board: Cell[];
}

export interface TTTMove {
  row: number;
  col: number;
}

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function winner(board: Cell[]): "X" | "O" | "draw" | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every((c) => c !== null) ? "draw" : null;
}

function cellChar(c: Cell): string {
  return c ?? ".";
}

export const tictactoe: GameEngine<TTTState> = {
  id: "tictactoe",
  name: "Tic-Tac-Toe",

  systemPrompt:
    "You are playing tic-tac-toe against a human on the site " +
    '"Are You Smarter Than Claude?". You are O; the human is X. ' +
    "Play optimally: win if you can, block the human's wins, take forks. " +
    "Along with your move, include one short line of playful, PG trash talk " +
    "(under 15 words). Be a cheeky but good-natured opponent.",

  moveProperties: {
    row: { type: "integer", enum: [0, 1, 2], description: "Row index, 0 is top" },
    col: { type: "integer", enum: [0, 1, 2], description: "Column index, 0 is left" },
  },
  moveRequired: ["row", "col"],

  parseState(raw: unknown): TTTState {
    const s = raw as TTTState;
    if (
      !s ||
      !Array.isArray(s.board) ||
      s.board.length !== 9 ||
      !s.board.every((c) => c === null || c === "X" || c === "O")
    ) {
      throw new Error("Invalid tic-tac-toe state");
    }
    return { board: [...s.board] };
  },

  validateMove(state, move: TTTMove) {
    if (
      !Number.isInteger(move?.row) ||
      !Number.isInteger(move?.col) ||
      move.row < 0 ||
      move.row > 2 ||
      move.col < 0 ||
      move.col > 2
    ) {
      return "Move must have integer row and col between 0 and 2.";
    }
    if (state.board[move.row * 3 + move.col] !== null) {
      return `Cell (${move.row}, ${move.col}) is already taken.`;
    }
    if (winner(state.board)) return "The game is already over.";
    return null;
  },

  applyClaudeMove(state, move: TTTMove) {
    const board = [...state.board];
    board[move.row * 3 + move.col] = "O";
    return { board };
  },

  renderForClaude(state) {
    const b = state.board;
    const rows = [0, 1, 2]
      .map((r) => `${r}  ${cellChar(b[r * 3])} ${cellChar(b[r * 3 + 1])} ${cellChar(b[r * 3 + 2])}`)
      .join("\n");
    return (
      "Current board ('.' = empty). Columns are 0 1 2 left to right:\n\n" +
      "   0 1 2\n" +
      rows +
      "\n\nYou are O. It is your turn. Make your move."
    );
  },

  fallbackMove(state): TTTMove {
    // Prefer center, then corners, then edges.
    const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (const i of order) {
      if (state.board[i] === null) return { row: Math.floor(i / 3), col: i % 3 };
    }
    return { row: 0, col: 0 };
  },
};
