"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { keyToDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import type { ActivityType, RecurrenceType } from "@/generated/prisma/enums";

function parseCommonFields(formData: FormData) {
  const recurrence = String(formData.get("recurrence")) as RecurrenceType;
  const daysOfWeek = formData
    .getAll("daysOfWeek")
    .map((d) => Number(d))
    .filter((n) => !Number.isNaN(n));
  const startDateKey = String(formData.get("startDate") || "");
  const endDateKey = String(formData.get("endDate") || "");
  const str = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: str("description"),
    type: String(formData.get("type")) as ActivityType,
    points: Number(formData.get("points") ?? 0) || 0,
    timeStart: str("timeStart"),
    timeEnd: str("timeEnd"),
    durationMin: formData.get("durationMin")
      ? Number(formData.get("durationMin")) || null
      : null,
    recurrence,
    daysOfWeek:
      recurrence === "WEEKLY" || recurrence === "CUSTOM" ? daysOfWeek : [],
    startDate: keyToDate(startDateKey),
    endDate: endDateKey ? keyToDate(endDateKey) : null,
  };
}

export async function createActivityAction(formData: FormData): Promise<void> {
  await requireEditor();
  const common = parseCommonFields(formData);
  const isOpen = String(formData.get("assignMode") ?? "") === "open";

  if (isOpen) {
    await prisma.activity.create({ data: { ...common, assignedToId: null } });
  } else {
    const assignedToIds = formData
      .getAll("assignedToIds")
      .map(String)
      .filter(Boolean);
    if (assignedToIds.length === 0) {
      throw new Error("יש לבחור לפחות ילד אחד או לסמן פעילות פתוחה לכולם");
    }
    await prisma.$transaction(
      assignedToIds.map((assignedToId) =>
        prisma.activity.create({ data: { ...common, assignedToId } }),
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect("/activities");
}

export async function updateActivityAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const common = parseCommonFields(formData);
  const assignedToId = String(formData.get("assignedToId") ?? "") || null;
  await prisma.activity.update({
    where: { id },
    data: { ...common, assignedToId },
  });
  revalidatePath("/", "layout");
  redirect("/activities");
}

export async function deleteActivityAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  await prisma.activity.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function duplicateActivityAction(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const src = await prisma.activity.findUnique({ where: { id } });
  if (!src) return;
  const { id: _id, createdAt, updatedAt, ...rest } = src;
  void _id;
  void createdAt;
  void updatedAt;
  await prisma.activity.create({
    data: { ...rest, title: `${src.title} (עותק)` },
  });
  revalidatePath("/", "layout");
}
