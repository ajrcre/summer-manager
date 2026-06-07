"use server";

import { revalidatePath } from "next/cache";
import { toggleCompletion } from "@/lib/completions";
import { setCurrentMember } from "@/lib/members";

/** Mark/unmark an activity occurrence complete. Open to viewers and editors. */
export async function toggleCompletionAction(
  activityId: string,
  dateKey: string,
  memberId: string,
): Promise<boolean> {
  const nowComplete = await toggleCompletion(activityId, dateKey, memberId);
  revalidatePath("/", "layout");
  return nowComplete;
}

/** Switch which family member is in focus. */
export async function switchMemberAction(memberId: string): Promise<void> {
  await setCurrentMember(memberId);
  revalidatePath("/", "layout");
}
