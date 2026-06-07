import { getOccurrencesForRange } from "@/lib/activities";
import { addDaysKey, rangeKeys } from "@/lib/dates";

export type Progress = {
  completed: number;
  total: number;
  percent: number; // 0..100, rounded
};

function toProgress(completed: number, total: number): Progress {
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/** Daily completion progress for a member (or whole family if memberId omitted). */
export async function getDailyProgress(
  dayKey: string,
  memberId?: string,
): Promise<Progress> {
  const occ = await getOccurrencesForRange(dayKey, dayKey, { memberId });
  const completed = occ.filter((o) => o.completion).length;
  return toProgress(completed, occ.length);
}

export type WeeklyProgress = Progress & {
  perDay: { dateKey: string; progress: Progress }[];
};

/** Weekly progress with a per-day breakdown (for a simple trend bar chart). */
export async function getWeeklyProgress(
  weekStartKey: string,
  memberId?: string,
): Promise<WeeklyProgress> {
  const weekEndKey = addDaysKey(weekStartKey, 6);
  const occ = await getOccurrencesForRange(weekStartKey, weekEndKey, {
    memberId,
  });

  const perDay = rangeKeys(weekStartKey, weekEndKey).map((dateKey) => {
    const dayOcc = occ.filter((o) => o.dateKey === dateKey);
    const completed = dayOcc.filter((o) => o.completion).length;
    return { dateKey, progress: toProgress(completed, dayOcc.length) };
  });

  const completed = occ.filter((o) => o.completion).length;
  return { ...toProgress(completed, occ.length), perDay };
}
