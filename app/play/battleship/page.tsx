"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GameShell } from "@/components/game/GameShell";
import type { Outcome } from "@/components/game/ResultCard";
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
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="flex flex-col gap-1">
        {INDEXES.map((row) => (
          <div key={row} className="flex gap-1">
            {INDEXES.map((col) => {
              const shot = shotAt(shots, row, col);
              const isShip = revealShips && shipCells.has(`${row},${col}`);
              const live = !!onFire && !shot && !disabled;
              const tone = !shot
                ? isShip
                  ? "bg-foreground/15"
                  : "bg-white/40"
                : shot.result === "miss"
                  ? "bg-white/40"
                  : shot.result === "hit"
                    ? "bg-accent"
                    : "bg-foreground";
              return (
                <button
                  key={col}
                  type="button"
                  onClick={onFire ? () => onFire(row, col) : undefined}
                  disabled={!live}
                  aria-label={`${title} cell ${row},${col}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors sm:h-9 sm:w-9 ${tone} ${
                    live ? "cursor-pointer hover:border-accent hover:bg-white/80" : ""
                  }`}
                >
                  {shot?.result === "miss" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
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
    >
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <Board
          title="Claude's waters"
          shots={humanShots}
          fleet={hydrated ? fleets.claude : []}
          revealShips={false}
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

      <div className="flex flex-col items-center gap-2">
        {!started && (
          <button
            onClick={shuffle}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-accent"
          >
            Shuffle fleet
          </button>
        )}
        <p className="text-xs text-muted">
          Click a cell in Claude&apos;s waters to fire. You shoot first.
        </p>
      </div>
    </GameShell>
  );
}
