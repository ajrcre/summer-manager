"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";
import { COLOR_PRESETS } from "@/lib/constants";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    avatar: String(formData.get("avatar") ?? "🙂"),
    color: String(formData.get("color") || COLOR_PRESETS[0]),
    role: String(formData.get("role")) as Role,
  };
}

export async function createMemberAction(formData: FormData): Promise<void> {
  await requireEditor();
  const data = parse(formData);
  if (data.name) await prisma.familyMember.create({ data });
  revalidatePath("/", "layout");
}

export async function updateMemberAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  await prisma.familyMember.update({ where: { id }, data: parse(formData) });
  revalidatePath("/", "layout");
}

export async function deleteMemberAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  await prisma.familyMember.delete({ where: { id } });
  revalidatePath("/", "layout");
}
