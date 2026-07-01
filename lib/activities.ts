import type {
  Activity,
  Completion,
  FamilyMember,
} from "@/generated/prisma/client";
import type { ActivityType } from "@/generated/prisma/enums";
import { keyToDate, storedDateToKey } from "@/lib/dates";
import { getOccurrenceKeys } from "@/lib/recurrence";
import { prisma } from "@/lib/prisma";

export type ActivityWithMember = Activity & { assignedTo: FamilyMember | null };

export type Occurrence = {
  activity: ActivityWithMember;
  dateKey: string;
  completion: Completion | null;
};

export type OccurrenceFilter = {
  memberId?: string;
  type?: ActivityType;
};

/**
 * The single source of truth for "what happens between these dates".
 * Expands every (optionally filtered) activity into its occurrences in the
 * inclusive [startKey, endKey] window, left-joined with completion records.
 * Results are sorted by date, then time-of-day, then title.
 */
export async function getOccurrencesForRange(
  startKey: string,
  endKey: string,
  filter: OccurrenceFilter = {},
): Promise<Occurrence[]> {
  const activities = await prisma.activity.findMany({
    where: {
      AND: [
        filter.memberId
          ? { OR: [{ assignedToId: filter.memberId }, { assignedToId: null }] }
          : {},
        filter.type ? { type: filter.type } : {},
        { startDate: { lte: keyToDate(endKey) } },
        { OR: [{ endDate: null }, { endDate: { gte: keyToDate(startKey) } }] },
      ],
    },
    include: { assignedTo: true },
  });

  const activityIds = activities.map((a) => a.id);
  const completions = activityIds.length
    ? await prisma.completion.findMany({
        where: {
          activityId: { in: activityIds },
          occurrenceDate: {
            gte: keyToDate(startKey),
            lte: keyToDate(endKey),
          },
        },
      })
    : [];

  // Index completions by `${activityId}|${dateKey}` for O(1) lookup.
  const completionByKey = new Map<string, Completion>();
  for (const c of completions) {
    completionByKey.set(
      `${c.activityId}|${storedDateToKey(c.occurrenceDate)}`,
      c,
    );
  }

  const occurrences: Occurrence[] = [];
  for (const activity of activities) {
    for (const dateKey of getOccurrenceKeys(activity, startKey, endKey)) {
      occurrences.push({
        activity,
        dateKey,
        completion: completionByKey.get(`${activity.id}|${dateKey}`) ?? null,
      });
    }
  }

  return sortOccurrences(occurrences);
}

/** Convenience wrapper for a single day. */
export function getOccurrencesForDay(
  dayKey: string,
  filter: OccurrenceFilter = {},
): Promise<Occurrence[]> {
  return getOccurrencesForRange(dayKey, dayKey, filter);
}

export function sortOccurrences(occurrences: Occurrence[]): Occurrence[] {
  return occurrences.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
    const ta = a.activity.timeStart ?? "99:99";
    const tb = b.activity.timeStart ?? "99:99";
    if (ta !== tb) return ta < tb ? -1 : 1;
    return a.activity.title.localeCompare(b.activity.title, "he");
  });
}
