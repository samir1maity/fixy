import moment from "moment-timezone";

const TZ = "UTC";

export function startOfTodayUTC(): Date {
  return moment.tz(TZ).startOf("day").toDate();
}

export function daysAgoUTC(n: number): Date {
  return moment.tz(TZ).subtract(n, "days").startOf("day").toDate();
}

export function toDateKey(d: Date): string {
  return moment.utc(d).format("YYYY-MM-DD");
}

export function toHourKey(d: Date): string {
  return moment.utc(d).format("HH:00");
}

/** Build a map pre-filled with 0 for every day in the last `days` days. */
export function buildDailyBuckets(days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(toDateKey(daysAgoUTC(i)), 0);
  }
  return map;
}

/** Build a map pre-filled with 0 for every hour 00–23. */
export function buildHourlyBuckets(): Map<string, number> {
  const map = new Map<string, number>();
  for (let h = 0; h < 24; h++) {
    map.set(String(h).padStart(2, "0") + ":00", 0);
  }
  return map;
}

export function aggregateDailyStats(
  rows: { createdAt: Date }[],
  days: number
): { date: string; requests: number }[] {
  const buckets = buildDailyBuckets(days);
  for (const row of rows) {
    const key = toDateKey(row.createdAt);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }
  return Array.from(buckets.entries()).map(([date, requests]) => ({ date, requests }));
}

export function aggregateHourlyStats(
  rows: { createdAt: Date }[]
): { hour: string; requests: number }[] {
  const buckets = buildHourlyBuckets();
  for (const row of rows) {
    const key = toHourKey(row.createdAt);
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
      map.set(row.sessionId, {
        startedAt: row.createdAt,
        messageCount: 1,
        lastMessage: row.query,
      });
    } else {
      existing.messageCount += 1;
      if (row.createdAt < existing.startedAt) existing.startedAt = row.createdAt;
    }
  }

  return Array.from(map.entries())
    .slice(0, limit)
    .map(([sessionId, s]) => ({ sessionId, ...s }));
}
