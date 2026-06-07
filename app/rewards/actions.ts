"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createRewardAction(formData: FormData): Promise<void> {
  await requireEditor();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const pointCost = Number(formData.get("pointCost") ?? 0) || 0;
  if (name) {
    await prisma.reward.create({ data: { name, description, pointCost } });
  }
  revalidatePath("/rewards");
}

export async function deleteRewardAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  await prisma.reward.delete({ where: { id } });
  revalidatePath("/rewards");
}
