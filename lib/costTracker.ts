/**
 * In-memory Claude spend tracking with a site-wide daily budget.
 *
 * The in-memory totals reset on instance restart and are per-instance, so the
 * service must run with max-instances=1 for the cap to be truly global. Every
 * move also emits a structured "claude-spend" log line, making Cloud Run logs
 * the durable ledger:
 *   gcloud logging read 'jsonPayload.type="claude-spend"'
 */

export const DAILY_BUDGET_USD = 4;

const day = { date: currentUtcDate(), spentUsd: 0, moves: 0 };
const instance = { spentUsd: 0, moves: 0, since: new Date().toISOString() };

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

/** Returns an error message if today's budget is exhausted, else null. */
export function checkDailyBudget(): string | null {
  rollDay();
  if (day.spentUsd >= DAILY_BUDGET_USD) {
    return `Claude has spent his $${DAILY_BUDGET_USD} daily allowance. Come back tomorrow.`;
  }
  return null;
}

export function recordSpend(meta: {
  costUsd: number;
  game: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  fallback: boolean;
}) {
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
}

export function getSpendSummary() {
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
