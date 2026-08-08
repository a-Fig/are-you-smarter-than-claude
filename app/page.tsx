import Link from "next/link";
import { RotatingWord } from "@/components/RotatingWord";
import { TRAITS, MODELS } from "@/lib/words";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        A game against the machine
      </p>

      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Are you{" "}
        <RotatingWord words={TRAITS} intervalMs={2200} className="text-accent" />{" "}
        than{" "}
        <RotatingWord words={MODELS} intervalMs={2800} className="text-accent" />?
      </h1>

      <p className="max-w-md text-lg text-muted">
        A handful of quick mini-games. You versus Claude. Let&apos;s find out.
      </p>

      <Link
        href="/play"
        className="rounded-full bg-accent px-8 py-3 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Play
      </Link>
    </main>
  );
}
