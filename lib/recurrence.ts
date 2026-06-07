import type { Activity } from "@/generated/prisma/client";
import { WEEKDAY_INDICES } from "@/lib/constants";
import { dayOfWeek, rangeKeys, storedDateToKey } from "@/lib/dates";

/**
 * Compute the date keys ("YYYY-MM-DD") on which an activity occurs within the
 * inclusive [rangeStartKey, rangeEndKey] window. Occurrences are never stored;
 * they are derived from the recurrence rule each time.
 */
export function getOccurrenceKeys(
  activity: Pick<
    Activity,
    "recurrence" | "daysOfWeek" | "startDate" | "endDate"
  >,
  rangeStartKey: string,
  rangeEndKey: string,
): string[] {
  const activityStart = storedDateToKey(activity.startDate);
  const activityEnd = activity.endDate ? storedDateToKey(activity.endDate) : null;

  // Clamp the requested range to the activity's own active window.
  const start = activityStart > rangeStartKey ? activityStart : rangeStartKey;
  const end =
    activityEnd && activityEnd < rangeEndKey ? activityEnd : rangeEndKey;
  if (start > end) return [];

  switch (activity.recurrence) {
    case "NONE":
      return activityStart >= rangeStartKey && activityStart <= rangeEndKey
        ? [activityStart]
        : [];

    case "DAILY":
      return rangeKeys(start, end);

    case "WEEKDAYS":
      return rangeKeys(start, end).filter((k) =>
        WEEKDAY_INDICES.includes(dayOfWeek(k)),
      );

    case "WEEKLY":
    case "CUSTOM": {
      const days = activity.daysOfWeek ?? [];
      if (days.length === 0) return [];
      return rangeKeys(start, end).filter((k) => days.includes(dayOfWeek(k)));
    }

    default:
      return [];
  }
}

/** Does the activity occur on this specific date key? */
export function occursOn(
  activity: Pick<
    Activity,
    "recurrence" | "daysOfWeek" | "startDate" | "endDate"
  >,
  key: string,
): boolean {
  return getOccurrenceKeys(activity, key, key).length === 1;
}
