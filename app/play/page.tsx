import Link from "next/link";

const GAMES: {
  slug: string;
  name: string;
  blurb: string;
  odds: string;
  live: boolean;
}[] = [
  {
    slug: "tictactoe",
    name: "Tic-Tac-Toe",
    blurb: "The classic. Claude plays it straight — can you even force a draw?",
    odds: "Claude rarely loses",
    live: true,
  },
  {
    slug: "connect4",
    name: "Connect Four",
    blurb: "Drop discs, build traps. Big models are famously bad at this.",
    odds: "Very winnable",
    live: true,
  },
  {
    slug: "battleship",
    name: "Battleship",
    blurb: "Hide your fleet, hunt Claude's. A little luck goes a long way.",
    odds: "Anyone's game",
    live: true,
  },
  {
    slug: "wordle",
    name: "Wordle Race",
    blurb: "Same secret word, separate boards. Fewest guesses wins.",
    odds: "Tight race",
    live: true,
  },
  {
    slug: "rps",
    name: "Rock-Paper-Scissors",
    blurb: "Best of 7. Claude studies your past throws and hunts for patterns.",
    odds: "Mind games",
    live: true,
  },
  {
    slug: "trivia",
    name: "Trivia",
    blurb: "Movies, history, math, or Bay Area. Real quiz questions, head to head.",
    odds: "You will lose (but faster?)",
    live: true,
  },
];

export default function Play() {
  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Pick your game
        </h1>
        <p className="mt-2 text-muted">
          Every match is timed and metered. Even when you lose, you were cheaper.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {GAMES.map((g) =>
          g.live ? (
            <Link
              key={g.slug}
              href={`/play/${g.slug}`}
              className="group flex flex-col gap-2 rounded-3xl border border-border bg-white/40 p-6 text-left transition-colors hover:border-accent hover:bg-white/70"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight group-hover:text-accent">
                  {g.name}
                </h2>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  {g.odds}
                </span>
              </div>
              <p className="text-sm text-muted">{g.blurb}</p>
            </Link>
          ) : (
            <div
              key={g.slug}
              className="flex flex-col gap-2 rounded-3xl border border-dashed border-border p-6 text-left opacity-60"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{g.name}</h2>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  soon
                </span>
              </div>
              <p className="text-sm text-muted">{g.blurb}</p>
            </div>
          ),
        )}
      </div>

      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Back home
      </Link>
    </main>
  );
}
