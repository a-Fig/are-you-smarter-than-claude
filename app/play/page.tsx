import Link from "next/link";

export default function Play() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Games coming soon
      </h1>
      <p className="max-w-md text-lg text-muted">
        We&apos;re still building the lineup. Check back shortly.
      </p>
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Back home
      </Link>
    </main>
  );
}
