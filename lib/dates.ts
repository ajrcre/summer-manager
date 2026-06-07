// Calendar-date helpers.
// Convention: a "date key" is a "YYYY-MM-DD" string. In the DB, date-only values
// (startDate, endDate, occurrenceDate) are stored at UTC midnight of that calendar
// date, so formatting/parsing is done in UTC. "Today" is resolved in Israel time
// because that's where the family lives (the Vercel server runs in UTC).

export const FAMILY_TIME_ZONE = "Asia/Jerusalem";

/** Current calendar date in the family's timezone, as a "YYYY-MM-DD" key. */
export function todayKey(): string {
  return dateToKey(new Date());
}

/** Current wall-clock time in the family's timezone, as "HH:mm". */
export function nowTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: FAMILY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** Format any Date into a "YYYY-MM-DD" key using the family's timezone. */
export function dateToKey(date: Date): string {
  // en-CA yields YYYY-MM-DD; timeZone applies the wall-clock date in Israel.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FAMILY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Parse a "YYYY-MM-DD" key into a Date at UTC midnight (for DB storage). */
export function keyToDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Convert a stored date-only DB value into its "YYYY-MM-DD" key (read in UTC). */
export function storedDateToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Day of week for a date key: 0=Sun .. 6=Sat. */
export function dayOfWeek(key: string): number {
  return keyToDate(key).getUTCDay();
}

/** Add `n` days to a date key. */
export function addDaysKey(key: string, n: number): string {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Inclusive list of date keys from `startKey` to `endKey`. */
export function rangeKeys(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let cur = startKey;
  while (cur <= endKey) {
    out.push(cur);
    cur = addDaysKey(cur, 1);
  }
  return out;
}

/** Sunday date key of the week containing `key` (weeks start Sunday). */
export function startOfWeekKey(key: string): string {
  return addDaysKey(key, -dayOfWeek(key));
}

/** First-of-month date key for the month containing `key`. */
export function startOfMonthKey(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

/** Last-of-month date key for the month containing `key`. */
export function endOfMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month
  return `${key.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}
