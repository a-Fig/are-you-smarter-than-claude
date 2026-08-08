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

const BRUTAL_FONT = "[font-family:'Archivo_Black','Arial_Black',Arial,sans-serif]";

export default function Play() {
  return (
    <main
      className={`flex flex-1 flex-col items-center gap-10 bg-[#F5F0E8] px-6 py-16 text-black ${BRUTAL_FONT}`}
    >
      <div className="text-center">
        <h1 className="text-3xl uppercase tracking-tight sm:text-5xl">
          Pick your{" "}
          <span className="inline-block border-3 border-black bg-[#FF5C39] px-2 shadow-[4px_4px_0_#000]">
            game
          </span>
        </h1>
        <p className="mt-4 font-sans text-sm font-medium uppercase tracking-wide text-black/70">
          Every match is timed and metered. Even when you lose, you were cheaper.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        {GAMES.filter((g) => g.live).map((g) => (
          <Link
            key={g.slug}
            href={`/play/${g.slug}`}
            className="group flex flex-col gap-3 border-4 border-black bg-white p-6 text-left shadow-[6px_6px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg uppercase leading-tight sm:text-xl">{g.name}</h2>
              <span className="shrink-0 border-2 border-black bg-[#FF5C39] px-2 py-0.5 text-[10px] uppercase tracking-wide shadow-[2px_2px_0_#000]">
                {g.odds}
              </span>
            </div>
            <p className="font-sans text-sm font-medium text-black/70">{g.blurb}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="border-3 border-black bg-[#FF5C39] px-6 py-2 text-sm uppercase tracking-wide shadow-[4px_4px_0_#000] transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]"
      >
        Back home
      </Link>
    </main>
  );
}
