"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome, RecapRow } from "@/components/game/ResultCard";
import { requestClaudeMove, useMatchStats } from "@/lib/match";
import type { ModelKey } from "@/lib/models";
import {
  BOARD_SIZE,
  SHIP_SIZES,
  allSunk,
  randomFleet,
  recordShot,
  remainingShipSizes,
  shotAt,
  type BattleshipMove,
  type BattleshipState,
  type Fleet,
  type Shot,
} from "@/lib/games/battleship";

const INDEXES = Array.from({ length: BOARD_SIZE }, (_, i) => i);

/** A "sunk" entry covers every cell of the ship, so non-misses are hits. */
function hitCount(shots: Shot[]): number {
  return shots.filter((s) => s.result !== "miss").length;
}

function sunkCount(fleet: Fleet, shots: Shot[]): number {
  return fleet.length - remainingShipSizes(fleet, shots).length;
}

function hitRate(shots: Shot[]): number {
  return shots.length ? hitCount(shots) / shots.length : 0;
}

function betterSide(you: number, claude: number): RecapRow["winner"] {
  if (you === claude) return "tie";
  return you > claude ? "you" : "claude";
}

interface Fleets {
  human: Fleet;
  claude: Fleet;
}

const noopSubscribe = () => () => {};

function newFleets(): Fleets {
  return { human: randomFleet(), claude: randomFleet() };
}

/**
 * The fleets are random, so the server's copy can never match the browser's.
 * Nothing fleet-dependent is rendered until this flips true after hydration.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function Board({
  title,
  shots,
  fleet,
  revealShips,
  onFire,
  disabled,
}: {
  title: string;
  shots: Shot[];
  fleet: Fleet;
  revealShips: boolean;
  onFire?: (row: number, col: number) => void;
  disabled: boolean;
}) {
  const shipCells = useMemo(
    () => new Set(fleet.flatMap((s) => s.cells.map((c) => `${c.row},${c.col}`))),
    [fleet],
  );
  const remaining = fleet.length ? remainingShipSizes(fleet, shots) : SHIP_SIZES;

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-sm uppercase tracking-[0.15em]">{title}</h2>
      <div className="flex flex-col border-3 border-black bg-white shadow-[4px_4px_0_#000]">
        {INDEXES.map((row) => (
          <div key={row} className="flex">
            {INDEXES.map((col) => {
              const shot = shotAt(shots, row, col);
              const isShip = revealShips && shipCells.has(`${row},${col}`);
              const live = !!onFire && !shot && !disabled;
              const tone = !shot
                ? isShip
                  ? "bg-black"
                  : "bg-white"
                : shot.result === "miss"
                  ? "bg-white"
                  : shot.result === "hit"
                    ? "bg-[#FF5C39]"
                    : "bg-black";
              return (
                <button
                  key={col}
                  type="button"
                  onClick={onFire ? () => onFire(row, col) : undefined}
                  disabled={!live}
                  aria-label={`${title} cell ${row},${col}`}
                  className={`flex h-8 w-8 items-center justify-center border border-black transition-colors sm:h-9 sm:w-9 ${tone} ${
                    live ? "cursor-pointer hover:bg-[#FF5C39]/40" : ""
                  }`}
                >
                  {shot?.result === "miss" && <span className="h-1.5 w-1.5 bg-black" />}
                  {shot?.result === "sunk" && (
                    <span className="text-[11px] leading-none text-[#FF5C39]">✕</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="font-sans text-xs font-bold uppercase tracking-wide text-black/60">
        {remaining.length ? `Afloat: ${remaining.join(" · ")}` : "All ships sunk"}
      </p>
    </div>
  );
}

export default function BattleshipPage() {
  const [model, setModel] = useState<ModelKey>("sonnet");
  const hydrated = useHydrated();
  const [fleets, setFleets] = useState<Fleets>(newFleets);
  const [humanShots, setHumanShots] = useState<Shot[]>([]);
  const [claudeShots, setClaudeShots] = useState<Shot[]>([]);
  const [thinking, setThinking] = useState(false);
  const [trashTalk, setTrashTalk] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const { stats, startHumanTurn, endHumanTurn, recordClaudeMove, resetStats } =
    useMatchStats();

  useEffect(() => {
    startHumanTurn();
  }, [startHumanTurn]);

  const shuffle = useCallback(() => {
    if (started) return;
    setFleets((f) => ({ human: randomFleet(), claude: f.claude }));
  }, [started]);

  const rematch = useCallback(() => {
    setFleets(newFleets());
    setHumanShots([]);
    setClaudeShots([]);
    setThinking(false);
    setTrashTalk(null);
    setOutcome(null);
    setError(null);
    setStarted(false);
    resetStats();
    startHumanTurn();
  }, [resetStats, startHumanTurn]);

  const fire = useCallback(
    async (row: number, col: number) => {
      if (!hydrated || thinking || outcome || shotAt(humanShots, row, col)) return;
      setError(null);
      setStarted(true);
      endHumanTurn();

      const afterHuman = recordShot(fleets.claude, humanShots, row, col).shots;
      setHumanShots(afterHuman);
      if (allSunk(fleets.claude, afterHuman)) {
        setOutcome("win");
        return;
      }

      setThinking(true);
      try {
        const state: BattleshipState = {
          shots: claudeShots,
          remainingShips: remainingShipSizes(fleets.human, claudeShots),
        };
        const r = await requestClaudeMove("battleship", state, model);
        recordClaudeMove(r);
        setTrashTalk(r.trashTalk || null);
        const move = r.move as BattleshipMove;
        const afterClaude = recordShot(
          fleets.human,
          claudeShots,
          move.row,
          move.col,
        ).shots;
        setClaudeShots(afterClaude);
        if (allSunk(fleets.human, afterClaude)) {
          setOutcome("loss");
        } else {
          startHumanTurn();
        }
      } catch (e) {
        // The human's shot stands; give the turn back so the next click
        // simply retries the exchange.
        setError(e instanceof Error ? e.message : "Something went wrong.");
        startHumanTurn();
      } finally {
        setThinking(false);
      }
    },
    [
      hydrated,
      fleets,
      humanShots,
      claudeShots,
      thinking,
      outcome,
      model,
      endHumanTurn,
      recordClaudeMove,
      startHumanTurn,
    ],
  );

  const recap = useMemo<RecapRow[] | undefined>(() => {
    if (!outcome) return undefined;
    const yourSunk = sunkCount(fleets.claude, humanShots);
    const claudeSunk = sunkCount(fleets.human, claudeShots);
    const pct = (shots: Shot[]) =>
      shots.length ? `${Math.round(hitRate(shots) * 100)}%` : "—";
    return [
      {
        label: "Ships sunk",
        you: `${yourSunk} / ${fleets.claude.length}`,
        claude: `${claudeSunk} / ${fleets.human.length}`,
        winner: betterSide(yourSunk, claudeSunk),
      },
      {
        label: "Shots fired",
        you: `${humanShots.length}`,
        claude: `${claudeShots.length}`,
      },
      {
        label: "Hits landed",
        you: `${hitCount(humanShots)}`,
        claude: `${hitCount(claudeShots)}`,
        winner: betterSide(hitCount(humanShots), hitCount(claudeShots)),
      },
      {
        label: "Hit rate",
        you: pct(humanShots),
        claude: pct(claudeShots),
        winner: betterSide(hitRate(humanShots), hitRate(claudeShots)),
      },
    ];
  }, [outcome, fleets, humanShots, claudeShots]);

  return (
    <GameShell
      title="Battleship"
      model={model}
      onModelChange={setModel}
      modelLocked={started}
      stats={stats}
      thinking={thinking}
      trashTalk={trashTalk}
      outcome={outcome}
      onRematch={rematch}
      error={error}
      recap={recap}
    >
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <Board
          title="Claude's waters"
          shots={humanShots}
          fleet={hydrated ? fleets.claude : []}
          revealShips={!!outcome}
          onFire={fire}
          disabled={thinking || !!outcome || !hydrated}
        />
        <Board
          title="Your fleet"
          shots={claudeShots}
          fleet={hydrated ? fleets.human : []}
          revealShips
          disabled
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        {!started && (
          <button
            onClick={shuffle}
            className="border-3 border-black bg-white px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Shuffle fleet
          </button>
        )}
        <p className="font-sans text-xs font-bold text-black/60">
          Click a cell in Claude&apos;s waters to fire. You shoot first.
        </p>
      </div>
    </GameShell>
  );
}
