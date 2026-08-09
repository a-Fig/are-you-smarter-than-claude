import { getSpendSummary } from "@/lib/costTracker";

/**
 * Live spend meter. Daily totals are hydrated from and persisted to GCS, so
 * they survive restarts; "instance" figures are memory-only by design.
 */
export async function GET() {
  return Response.json(await getSpendSummary());
}
