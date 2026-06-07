"use server";

import { revalidatePath } from "next/cache";
import { lockEditor, unlockWithPin } from "@/lib/auth";

export async function unlockAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const pin = String(formData.get("pin") ?? "");
  const ok = await unlockWithPin(pin);
  if (!ok) return { error: "קוד שגוי, נסו שוב" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function lockAction(): Promise<void> {
  await lockEditor();
  revalidatePath("/", "layout");
}
