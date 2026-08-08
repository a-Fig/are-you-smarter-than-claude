import type { GameEngine } from "./types";

/** Human plays R (red), Claude plays Y (yellow). Grid is row-major, row 0 = top. */
export type Disc = "R" | "Y" | null;

export interface Connect4State {
  grid: Disc[][];
}

export interface Connect4Move {
  column: number;
}

const ROWS = 6;
const COLS = 7;
const CENTER_ORDER = [3, 2, 4, 1, 5, 0, 6];

function isFull(grid: Disc[][], col: number): boolean {
  return grid[0][col] !== null;
}

function legalColumns(grid: Disc[][]): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!isFull(grid, c)) cols.push(c);
  }
  return cols;
}

function dropRow(grid: Disc[][], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][col] === null) return r;
  }
  return -1;
}

export function winner(grid: Disc[][]): "R" | "Y" | "draw" | null {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const disc = grid[r][c];
      if (!disc) continue;
      for (const [dr, dc] of directions) {
        let count = 1;
        for (let step = 1; step < 4; step++) {
          const rr = r + dr * step;
          const cc = c + dc * step;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || grid[rr][cc] !== disc) break;
          count++;
        }
        if (count === 4) return disc;
      }
    }
  }
  return grid.every((row) => row.every((cell) => cell !== null)) ? "draw" : null;
}

function cellChar(c: Disc): string {
  return c ?? ".";
}

export const connect4: GameEngine<Connect4State> = {
  id: "connect4",
  name: "Connect Four",

  systemPrompt:
    "You are playing Connect Four against a human on the site " +
    '"Are You Smarter Than Claude?". You are Y (yellow); the human is R (red). ' +
    "Play to win: look for your own 4-in-a-row threats and block the human's before " +
    "they land. Along with your move, include one short line of playful, PG trash talk " +
    "(under 15 words). Be a cheeky but good-natured opponent.",

  moveProperties: {
    column: {
      type: "integer",
      enum: [0, 1, 2, 3, 4, 5, 6],
      description: "Column index to drop your disc into, 0 is leftmost",
    },
  },
  moveRequired: ["column"],

  parseState(raw: unknown): Connect4State {
    const s = raw as Connect4State;
    if (
      !s ||
      !Array.isArray(s.grid) ||
      s.grid.length !== ROWS ||
      !s.grid.every(
        (row) =>
          Array.isArray(row) &&
          row.length === COLS &&
          row.every((c) => c === null || c === "R" || c === "Y"),
      )
    ) {
      throw new Error("Invalid Connect Four state");
    }
    return { grid: s.grid.map((row) => [...row]) };
  },

  validateMove(state, move: Connect4Move) {
    if (!Number.isInteger(move?.column) || move.column < 0 || move.column > COLS - 1) {
      return `Move must have an integer column between 0 and ${COLS - 1}.`;
    }
    if (isFull(state.grid, move.column)) {
      return `Column ${move.column} is full.`;
    }
    if (winner(state.grid)) return "The game is already over.";
    return null;
  },

  applyClaudeMove(state, move: Connect4Move) {
    const grid = state.grid.map((row) => [...row]);
    const row = dropRow(grid, move.column);
    if (row === -1) throw new Error(`Column ${move.column} is full.`);
    grid[row][move.column] = "Y";
    return { grid };
  },

  renderForClaude(state) {
    const g = state.grid;
    const header = "   " + Array.from({ length: COLS }, (_, c) => c).join(" ");
    const rows = g
      .map((row) => "   " + row.map(cellChar).join(" "))
      .join("\n");
    const legal = legalColumns(g).join(", ");
    return (
      "Current board ('.' = empty). Column indices 0-6 are shown across the top; " +
      "row 0 is the top of the board:\n\n" +
      header +
      "\n" +
      rows +
      "\n\nDiscs fall to the lowest empty cell in the chosen column (gravity applies). " +
      "You are Y. It is your turn. Legal columns right now: " +
      legal +
      ". Make your move."
    );
  },

  fallbackMove(state): Connect4Move {
    for (const col of CENTER_ORDER) {
      if (!isFull(state.grid, col)) return { column: col };
    }
    return { column: 0 };
  },
};
