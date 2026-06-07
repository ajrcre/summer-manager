"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Goals are owned and managed by the kids themselves — these actions are
// intentionally NOT PIN-gated (unlike activity/member/reward editing).

export async function createGoalAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const memberId = String(formData.get("memberId") ?? "");
  if (title && memberId) {
    await prisma.goal.create({ data: { title, description, memberId } });
  }
  revalidatePath("/goals");
}

export async function updateGoalAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (id && title) {
    await prisma.goal.update({ where: { id }, data: { title, description } });
  }
  revalidatePath("/goals");
}

export async function deleteGoalAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  // Linked activities are kept (goalId set to null via onDelete: SetNull).
  await prisma.goal.delete({ where: { id } });
  revalidatePath("/goals");
}

/** Link or unlink an activity to a goal (one goal per activity). */
export async function setActivityGoalAction(
  activityId: string,
  goalId: string | null,
): Promise<void> {
  await prisma.activity.update({ where: { id: activityId }, data: { goalId } });
  revalidatePath("/goals");
}
