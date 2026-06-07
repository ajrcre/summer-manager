import { keyToDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

/**
 * Toggle completion for one activity occurrence (a specific activity on a
 * specific date). Returns the resulting state: true = now completed.
 */
export async function toggleCompletion(
  activityId: string,
  dateKey: string,
  memberId: string,
): Promise<boolean> {
  const occurrenceDate = keyToDate(dateKey);
  const existing = await prisma.completion.findUnique({
    where: { activityId_occurrenceDate: { activityId, occurrenceDate } },
  });

  if (existing) {
    await prisma.completion.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.completion.create({
    data: { activityId, occurrenceDate, memberId },
  });
  return true;
}
