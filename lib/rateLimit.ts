/**
 * In-memory rate limiting for the public move endpoint.
 * Resets on instance restart — fine for friends-and-family traffic.
 */

const PER_IP_PER_MINUTE = 30;
const PER_IP_PER_HOUR = 400;
const GLOBAL_PER_DAY = 5000;

interface Window {
  start: number;
  count: number;
}

const minuteWindows = new Map<string, Window>();
const hourWindows = new Map<string, Window>();
const globalWindow: Window = { start: Date.now(), count: 0 };

function hit(map: Map<string, Window>, key: string, windowMs: number, limit: number): boolean {
  const now = Date.now();
  const w = map.get(key);
  if (!w || now - w.start > windowMs) {
    map.set(key, { start: now, count: 1 });
    return true;
  }
  if (w.count >= limit) return false;
  w.count += 1;
  return true;
}

/** Returns an error message if the request should be rejected, else null. */
export function checkRateLimit(ip: string): string | null {
  const now = Date.now();
  if (now - globalWindow.start > 24 * 60 * 60 * 1000) {
    globalWindow.start = now;
    globalWindow.count = 0;
  }
  if (globalWindow.count >= GLOBAL_PER_DAY) {
    return "The site has hit its daily move budget. Try again tomorrow.";
  }
  if (!hit(minuteWindows, ip, 60_000, PER_IP_PER_MINUTE)) {
    return "Slow down — too many moves this minute.";
  }
  if (!hit(hourWindows, ip, 3_600_000, PER_IP_PER_HOUR)) {
    return "You've hit the hourly move limit. Take a break, champ.";
  }
  globalWindow.count += 1;

  // Opportunistic cleanup so the maps don't grow unbounded.
  if (minuteWindows.size > 5000) minuteWindows.clear();
  if (hourWindows.size > 5000) hourWindows.clear();
  return null;
}
