import { createEvents, type EventAttributes } from "ics";
import type { Activity } from "@/generated/prisma/client";
import { storedDateToKey } from "@/lib/dates";

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function parseTime(time: string | null): [number, number] {
  if (!time) return [9, 0];
  const [h, m] = time.split(":").map(Number);
  return [h || 0, m || 0];
}

function durationMinutes(a: Activity): number {
  if (a.timeStart && a.timeEnd) {
    const [sh, sm] = parseTime(a.timeStart);
    const [eh, em] = parseTime(a.timeEnd);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff > 0) return diff;
  }
  return a.durationMin ?? 30;
}

function recurrenceRule(a: Activity): string | undefined {
  const until = a.endDate
    ? `;UNTIL=${storedDateToKey(a.endDate).replace(/-/g, "")}T235959Z`
    : "";
  switch (a.recurrence) {
    case "DAILY":
      return `FREQ=DAILY${until}`;
    case "WEEKDAYS":
      return `FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH${until}`;
    case "WEEKLY":
    case "CUSTOM": {
      const days = a.daysOfWeek.map((d) => BYDAY[d]).join(",");
      return days ? `FREQ=WEEKLY;BYDAY=${days}${until}` : undefined;
    }
    default:
      return undefined;
  }
}

function toEvent(a: Activity): EventAttributes {
  const [y, m, d] = storedDateToKey(a.startDate).split("-").map(Number);
  const [h, min] = parseTime(a.timeStart);
  const rule = recurrenceRule(a);

  return {
    title: a.title,
    description: a.description ?? undefined,
    start: [y, m, d, h, min],
    // Floating local time so calendars show the wall-clock time as entered,
    // regardless of the server's timezone (Vercel runs in UTC).
    startInputType: "local",
    startOutputType: "local",
    duration: { minutes: durationMinutes(a) },
    ...(rule ? { recurrenceRule: rule } : {}),
    productId: "summer-manager",
    calName: "מתכנן הקיץ המשפחתי",
  };
}

/** Build an iCal (.ics) string from a list of activities. */
export function buildIcs(activities: Activity[]): string {
  const { error, value } = createEvents(activities.map(toEvent));
  if (error) throw error;
  return value ?? "";
}
