import { DAY_NAMES, MONTH_NAMES } from "@/lib/constants";
import { dayOfWeek } from "@/lib/dates";

/** "יום ראשון, 7 ביוני" */
export function formatDateHebrew(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  return `יום ${DAY_NAMES[dayOfWeek(key)]}, ${d} ב${MONTH_NAMES[m - 1]}`;
}

/** "7 ביוני 2026" */
export function formatDateLong(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ב${MONTH_NAMES[m - 1]} ${y}`;
}

/** "יוני 2026" */
export function formatMonthHebrew(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
