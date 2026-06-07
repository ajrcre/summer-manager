import type { Activity, Goal } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type GoalWithProgress = Goal & {
  activities: Activity[];
  completionCount: number; // total completions across linked activities
};

/**
 * A member's goals, each with its linked activities and a completion count
 * (how many times those activities have been marked done — gentle progress).
 */
export async function getGoalsForMember(
  memberId: string,
): Promise<GoalWithProgress[]> {
  const goals = await prisma.goal.findMany({
    where: { memberId },
    include: { activities: { orderBy: { timeStart: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const activityIds = goals.flatMap((g) => g.activities.map((a) => a.id));
  const completions = activityIds.length
    ? await prisma.completion.findMany({
        where: { activityId: { in: activityIds } },
        select: { activityId: true },
      })
    : [];

  const countByActivity = new Map<string, number>();
  for (const c of completions) {
    countByActivity.set(c.activityId, (countByActivity.get(c.activityId) ?? 0) + 1);
  }

  return goals.map((g) => ({
    ...g,
    completionCount: g.activities.reduce(
      (sum, a) => sum + (countByActivity.get(a.id) ?? 0),
      0,
    ),
  }));
}

/** Activities belonging to a member, for the goal-assignment picker. */
export function getMemberActivities(memberId: string): Promise<Activity[]> {
  return prisma.activity.findMany({
    where: { assignedToId: memberId },
    orderBy: [{ title: "asc" }],
  });
}
