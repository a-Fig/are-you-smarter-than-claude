import type { GameEngine } from "./types";

/**
 * 8x8 Battleship, four ships a side (4, 3, 3, 2). Touching is allowed,
 * overlapping and diagonals are not.
 *
 * Only the CLIENT knows where the fleets are. The state that travels to the
 * server is Claude's own tracking board — its past shots at the human board
 * and the sizes of the human ships still afloat — so the human's ship
 * positions are never transmitted.
 */

export const BOARD_SIZE = 8;
export const SHIP_SIZES = [4, 3, 3, 2];

export type ShotResult = "hit" | "miss" | "sunk";

export interface Shot {
  row: number;
  col: number;
  result: ShotResult;
}

export interface Cell {
  row: number;
  col: number;
}

export interface Ship {
  size: number;
  cells: Cell[];
}

export type Fleet = Ship[];

/** Claude's view of the game: what it has fired and what is left to sink. */
export interface BattleshipState {
  shots: Shot[];
  remainingShips: number[];
}

export interface BattleshipMove {
  row: number;
  col: number;
}

const INDEXES = Array.from({ length: BOARD_SIZE }, (_, i) => i);

function inBounds(n: unknown): n is number {
  return Number.isInteger(n) && (n as number) >= 0 && (n as number) < BOARD_SIZE;
}

export function shotAt(shots: Shot[], row: number, col: number): Shot | undefined {
  return shots.find((s) => s.row === row && s.col === col);
}

function shipAt(fleet: Fleet, row: number, col: number): Ship | undefined {
  return fleet.find((ship) => ship.cells.some((c) => c.row === row && c.col === col));
}

function isHitCell(shots: Shot[], cell: Cell): boolean {
  const s = shotAt(shots, cell.row, cell.col);
  return s ? s.result !== "miss" : false;
}

export function isSunk(ship: Ship, shots: Shot[]): boolean {
  return ship.cells.every((c) => isHitCell(shots, c));
}

/** Result of firing at (row, col) against `fleet`, given the shots so far. */
export function applyShot(
  fleet: Fleet,
  shots: Shot[],
  row: number,
  col: number,
): ShotResult {
  const ship = shipAt(fleet, row, col);
  if (!ship) return "miss";
  const rest = ship.cells.filter((c) => c.row !== row || c.col !== col);
  return rest.every((c) => isHitCell(shots, c)) ? "sunk" : "hit";
}

/**
 * Append a shot to a shot log. On a sinking blow the whole ship is marked
 * "sunk" — the shooter legitimately learns its full outline.
 */
export function recordShot(
  fleet: Fleet,
  shots: Shot[],
  row: number,
  col: number,
): { result: ShotResult; shots: Shot[] } {
  const existing = shotAt(shots, row, col);
  if (existing) return { result: existing.result, shots };

  const result = applyShot(fleet, shots, row, col);
  const next = [...shots, { row, col, result }];
  if (result === "sunk") {
    const ship = shipAt(fleet, row, col)!;
    return {
      result,
      shots: next.map((s) =>
        ship.cells.some((c) => c.row === s.row && c.col === s.col)
          ? { ...s, result: "sunk" as const }
          : s,
      ),
    };
  }
  return { result, shots: next };
}

export function remainingShipSizes(fleet: Fleet, shots: Shot[]): number[] {
  return fleet.filter((ship) => !isSunk(ship, shots)).map((ship) => ship.size);
}

export function allSunk(fleet: Fleet, shots: Shot[]): boolean {
  return fleet.length > 0 && fleet.every((ship) => isSunk(ship, shots));
}

function placeFleet(): Fleet | null {
  const taken = new Set<string>();
  const fleet: Fleet = [];
  for (const size of SHIP_SIZES) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const horizontal = Math.random() < 0.5;
      const rowSpan = horizontal ? BOARD_SIZE : BOARD_SIZE - size + 1;
      const colSpan = horizontal ? BOARD_SIZE - size + 1 : BOARD_SIZE;
      const row = Math.floor(Math.random() * rowSpan);
      const col = Math.floor(Math.random() * colSpan);
      const cells = Array.from({ length: size }, (_, k) => ({
        row: horizontal ? row : row + k,
        col: horizontal ? col + k : col,
      }));
      if (cells.some((c) => taken.has(`${c.row},${c.col}`))) continue;
      cells.forEach((c) => taken.add(`${c.row},${c.col}`));
      fleet.push({ size, cells });
      placed = true;
    }
    if (!placed) return null;
  }
  return fleet;
}

/** Random legal fleet. Uses Math.random, so call it client-side only. */
export function randomFleet(): Fleet {
  for (let attempt = 0; attempt < 50; attempt++) {
    const fleet = placeFleet();
    if (fleet) return fleet;
  }
  throw new Error("Could not place a fleet");
}

function gridChar(shot: Shot | undefined): string {
  if (!shot) return ".";
  if (shot.result === "miss") return "o";
  return shot.result === "sunk" ? "#" : "x";
}

export const battleship: GameEngine<BattleshipState> = {
  id: "battleship",
  name: "Battleship",

  systemPrompt:
    "You are playing Battleship against a human on the site " +
    '"Are You Smarter Than Claude?". The board is 8x8 and each side has four ' +
    "ships of sizes 4, 3, 3 and 2. Fire exactly one shot per turn at a cell " +
    "you have not fired at before. Hunt efficiently: search with a spread-out " +
    "pattern, and once you land a hit, work the cells around it until that " +
    "ship sinks. Along with your shot, include one short line of playful, PG " +
    "trash talk (under 15 words). Be a cheeky but good-natured opponent.",

  moveProperties: {
    row: { type: "integer", enum: INDEXES, description: "Row index, 0 is top" },
    col: { type: "integer", enum: INDEXES, description: "Column index, 0 is left" },
  },
  moveRequired: ["row", "col"],

  parseState(raw: unknown): BattleshipState {
    const s = raw as BattleshipState;
    if (!s || !Array.isArray(s.shots) || !Array.isArray(s.remainingShips)) {
      throw new Error("Invalid battleship state");
    }
    if (s.shots.length > BOARD_SIZE * BOARD_SIZE) {
      throw new Error("Too many shots in battleship state");
    }
    const shots = s.shots.map((shot) => {
      if (
        !shot ||
        !inBounds(shot.row) ||
        !inBounds(shot.col) ||
        (shot.result !== "hit" && shot.result !== "miss" && shot.result !== "sunk")
      ) {
        throw new Error("Invalid battleship shot");
      }
      return { row: shot.row, col: shot.col, result: shot.result };
    });
    if (
      !s.remainingShips.every(
        (size) => Number.isInteger(size) && size > 0 && size <= BOARD_SIZE,
      )
    ) {
      throw new Error("Invalid battleship fleet sizes");
    }
    return { shots, remainingShips: [...s.remainingShips] };
  },

  validateMove(state, move: BattleshipMove) {
    if (!inBounds(move?.row) || !inBounds(move?.col)) {
      return `Move must have integer row and col between 0 and ${BOARD_SIZE - 1}.`;
    }
    if (shotAt(state.shots, move.row, move.col)) {
      return `You already fired at (${move.row}, ${move.col}). Pick a new cell.`;
    }
    if (state.remainingShips.length === 0) return "The game is already over.";
    return null;
  },

  /**
   * The client holds the human's fleet and is the authority on results, so
   * the server records the shot with a "miss" placeholder purely to keep the
   * state well-formed; the client overwrites it with the real result.
   */
  applyClaudeMove(state, move: BattleshipMove) {
    return {
      shots: [...state.shots, { row: move.row, col: move.col, result: "miss" as const }],
      remainingShips: [...state.remainingShips],
    };
  },

  renderForClaude(state) {
    const rows = INDEXES.map(
      (r) =>
        `${r}  ` +
        INDEXES.map((c) => gridChar(shotAt(state.shots, r, c))).join(" "),
    ).join("\n");
    const afloat = state.remainingShips.length
      ? state.remainingShips.join(", ")
      : "none";
    return (
      "Your tracking grid of the enemy's 8x8 waters " +
      "('.' = never fired at, 'o' = miss, 'x' = hit, '#' = sunk ship):\n\n" +
      "   0 1 2 3 4 5 6 7\n" +
      rows +
      `\n\nEnemy ships still afloat (sizes): ${afloat}.` +
      `\nShots fired so far: ${state.shots.length}.` +
      "\n\nHunt efficiently; after a hit, try adjacent cells to finish the ship." +
      " Fire one shot at a cell marked '.'."
    );
  },

  fallbackMove(state): BattleshipMove {
    const open = (row: number, col: number) =>
      inBounds(row) && inBounds(col) && !shotAt(state.shots, row, col);

    for (const shot of state.shots) {
      if (shot.result !== "hit") continue;
      const neighbors = [
        { row: shot.row - 1, col: shot.col },
        { row: shot.row + 1, col: shot.col },
        { row: shot.row, col: shot.col - 1 },
        { row: shot.row, col: shot.col + 1 },
      ];
      const target = neighbors.find((n) => open(n.row, n.col));
      if (target) return target;
    }

    for (const parity of [0, 1]) {
      for (const row of INDEXES) {
        for (const col of INDEXES) {
          if ((row + col) % 2 === parity && open(row, col)) return { row, col };
        }
      }
    }
    return { row: 0, col: 0 };
  },
};
