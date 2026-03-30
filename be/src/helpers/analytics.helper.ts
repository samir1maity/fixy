import moment from "moment-timezone";
import { FALLBACK_TZ } from "../constants/analytics.constants.js";

/**
 * Returns the timezone string if valid, otherwise falls back to UTC.
 * This prevents moment-timezone from throwing on unknown zone names.
 */
export function resolveTimezone(tz?: string): string {
  if (tz && moment.tz.zone(tz)) return tz;
  return FALLBACK_TZ;
}

/** UTC Date representing the start of "today" in the given timezone. */
export function startOfTodayInTz(tz: string): Date {
  return moment.tz(tz).startOf("day").utc().toDate();
}

/** UTC Date representing the start of N days ago in the given timezone. */
export function daysAgoInTz(n: number, tz: string): Date {
  return moment.tz(tz).subtract(n, "days").startOf("day").utc().toDate();
}


function toDateKeyInTz(d: Date, tz: string): string {
  return moment.utc(d).tz(tz).format("YYYY-MM-DD");
}

function toHourKeyInTz(d: Date, tz: string): string {
  return moment.utc(d).tz(tz).format("HH:00");
}

function buildDailyBuckets(days: number, tz: string): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = moment.tz(tz).subtract(i, "days").format("YYYY-MM-DD");
    map.set(key, 0);
  }
  return map;
}

function buildHourlyBuckets(): Map<string, number> {
  const map = new Map<string, number>();
  for (let h = 0; h < 24; h++) {
    map.set(String(h).padStart(2, "0") + ":00", 0);
  }
  return map;
}

export function aggregateDailyStats(
  rows: { createdAt: Date }[],
  days: number,
  tz: string
): { date: string; requests: number }[] {
  const buckets = buildDailyBuckets(days, tz);
  for (const row of rows) {
    const key = toDateKeyInTz(row.createdAt, tz);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }
  return Array.from(buckets.entries()).map(([date, requests]) => ({ date, requests }));
}

export function aggregateHourlyStats(
  rows: { createdAt: Date }[],
  tz: string
): { hour: string; requests: number }[] {
  const buckets = buildHourlyBuckets();
  for (const row of rows) {
    const key = toHourKeyInTz(row.createdAt, tz);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }
  return Array.from(buckets.entries()).map(([hour, requests]) => ({ hour, requests }));
}

export function aggregateSessions(
  rows: { sessionId: string | null; query: string; createdAt: Date }[],
  limit: number
): { sessionId: string; startedAt: Date; messageCount: number; lastMessage: string }[] {
  const map = new Map<string, { startedAt: Date; messageCount: number; lastMessage: string }>();

  for (const row of rows) {
    if (!row.sessionId) continue;
    const existing = map.get(row.sessionId);
    if (!existing) {
      map.set(row.sessionId, { startedAt: row.createdAt, messageCount: 1, lastMessage: row.query });
    } else {
      existing.messageCount += 1;
      if (row.createdAt < existing.startedAt) existing.startedAt = row.createdAt;
    }
  }

  return Array.from(map.entries())
    .slice(0, limit)
    .map(([sessionId, s]) => ({ sessionId, ...s }));
}
