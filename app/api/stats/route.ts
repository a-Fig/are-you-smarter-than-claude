import { getSpendSummary } from "@/lib/costTracker";

/**
 * Live spend meter. In-memory, so "instance" figures reset on restart; the
 * durable ledger is the claude-spend log lines in Cloud Run.
 */
export async function GET() {
  return Response.json(getSpendSummary());
}
