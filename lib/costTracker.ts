/**
 * Claude spend tracking with a site-wide daily budget, durable across
 * instance restarts.
 *
 * Source of truth is a per-day JSON object in GCS (spend/<UTC date>.json),
 * hydrated once per instance per day and written through on every move.
 * Auth uses the Cloud Run metadata server; outside Cloud Run (local dev,
 * detected via K_SERVICE) persistence is skipped and the meter is
 * memory-only. Every move also emits a structured "claude-spend" log line:
 *   gcloud logging read 'jsonPayload.type="claude-spend"'
 *
 * The service must run with max-instances=1 so exactly one meter exists.
 */

export const DAILY_BUDGET_USD = 4;

const BUCKET = process.env.SPEND_BUCKET ?? "agent-gauntlet-aystc-spend";
const ON_CLOUD_RUN = !!process.env.K_SERVICE;

const day = { date: currentUtcDate(), spentUsd: 0, moves: 0 };
const instance = { spentUsd: 0, moves: 0, since: new Date().toISOString() };

let hydratedDate: string | null = null;
let hydration: Promise<void> | null = null;
let token: { value: string; expiresAt: number } | null = null;

function currentUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollDay() {
  const today = currentUtcDate();
  if (day.date !== today) {
    day.date = today;
    day.spentUsd = 0;
    day.moves = 0;
  }
}

async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;
  const res = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" } },
  );
  if (!res.ok) throw new Error(`metadata token: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

function objectUrl(date: string): string {
  return (
    `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o/` +
    encodeURIComponent(`spend/${date}.json`)
  );
}

async function loadPersisted(date: string): Promise<void> {
  const res = await fetch(`${objectUrl(date)}?alt=media`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
  });
  if (res.status === 404) return; // first move of the day
  if (!res.ok) throw new Error(`GCS read: HTTP ${res.status}`);
  const data = (await res.json()) as { spentUsd?: number; moves?: number };
  if (day.date === date) {
    day.spentUsd = Math.max(day.spentUsd, data.spentUsd ?? 0);
    day.moves = Math.max(day.moves, data.moves ?? 0);
  }
}

/** Hydrate today's totals from GCS exactly once per instance per day. */
async function ensureHydrated(): Promise<void> {
  if (!ON_CLOUD_RUN) return;
  rollDay();
  if (hydratedDate === day.date) return;
  if (!hydration) {
    const date = day.date;
    hydration = loadPersisted(date)
      .then(() => {
        hydratedDate = date;
      })
      .catch((e) => {
        // Fail open but loudly: a broken meter shouldn't down the site.
        console.error("cost tracker hydration failed", e);
      })
      .finally(() => {
        hydration = null;
      });
  }
  await hydration;
}

async function persist(): Promise<void> {
  if (!ON_CLOUD_RUN) return;
  try {
    const body = JSON.stringify({
      date: day.date,
      spentUsd: day.spentUsd,
      moves: day.moves,
    });
    const res = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET}/o` +
        `?uploadType=media&name=${encodeURIComponent(`spend/${day.date}.json`)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await accessToken()}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );
    if (!res.ok) throw new Error(`GCS write: HTTP ${res.status}`);
  } catch (e) {
    console.error("cost tracker persist failed", e);
  }
}

/** Returns an error message if today's budget is exhausted, else null. */
export async function checkDailyBudget(): Promise<string | null> {
  await ensureHydrated();
  rollDay();
  if (day.spentUsd >= DAILY_BUDGET_USD) {
    return `Claude has spent his $${DAILY_BUDGET_USD} daily allowance. Come back tomorrow.`;
  }
  return null;
}

export async function recordSpend(meta: {
  costUsd: number;
  game: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  fallback: boolean;
}): Promise<void> {
  await ensureHydrated();
  rollDay();
  day.spentUsd += meta.costUsd;
  day.moves += 1;
  instance.spentUsd += meta.costUsd;
  instance.moves += 1;
  console.log(
    JSON.stringify({
      type: "claude-spend",
      ...meta,
      daySpentUsd: Number(day.spentUsd.toFixed(6)),
    }),
  );
  await persist();
}

export async function getSpendSummary() {
  await ensureHydrated();
  rollDay();
  return {
    today: {
      date: day.date,
      spentUsd: Number(day.spentUsd.toFixed(4)),
      moves: day.moves,
      budgetUsd: DAILY_BUDGET_USD,
      remainingUsd: Number(Math.max(0, DAILY_BUDGET_USD - day.spentUsd).toFixed(4)),
    },
    instance: {
      spentUsd: Number(instance.spentUsd.toFixed(4)),
      moves: instance.moves,
      since: instance.since,
    },
  };
}
