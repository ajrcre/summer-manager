import { dateToKey, startOfWeekKey, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export type PointsSummary = {
  total: number;
  today: number;
  week: number;
};

/**
 * Points earned per member, bucketed by when the task was completed (completedAt,
 * read in family time). Returns a map keyed by memberId.
 */
export async function getPointsForMembers(
  memberIds: string[],
): Promise<Map<string, PointsSummary>> {
  const result = new Map<string, PointsSummary>();
  for (const id of memberIds) {
    result.set(id, { total: 0, today: 0, week: 0 });
  }
  if (memberIds.length === 0) return result;

  const completions = await prisma.completion.findMany({
    where: { memberId: { in: memberIds } },
    include: { activity: { select: { points: true } } },
  });

  const today = todayKey();
  const weekStart = startOfWeekKey(today);

  for (const c of completions) {
    const summary = result.get(c.memberId);
    if (!summary) continue;
    const pts = c.activity.points;
    const day = dateToKey(c.completedAt);
    summary.total += pts;
    if (day === today) summary.today += pts;
    if (day >= weekStart && day <= today) summary.week += pts;
  }

  return result;
}

export async function getMemberPoints(memberId: string): Promise<PointsSummary> {
  const map = await getPointsForMembers([memberId]);
  return map.get(memberId) ?? { total: 0, today: 0, week: 0 };
}
