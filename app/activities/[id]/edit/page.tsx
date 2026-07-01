import { notFound, redirect } from "next/navigation";
import { isEditor } from "@/lib/auth";
import { storedDateToKey } from "@/lib/dates";
import { getMembers } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { ActivityForm } from "@/components/ActivityForm";

export const dynamic = "force-dynamic";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isEditor())) redirect("/unlock");
  const { id } = await params;

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) notFound();
  const members = await getMembers();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ink">עריכת פעילות</h1>
      <ActivityForm
        members={members}
        defaults={{
          id: activity.id,
          title: activity.title,
          description: activity.description ?? "",
          type: activity.type,
          assignedToId: activity.assignedToId ?? "",
          points: String(activity.points),
          timeStart: activity.timeStart ?? "",
          timeEnd: activity.timeEnd ?? "",
          recurrence: activity.recurrence,
          daysOfWeek: activity.daysOfWeek,
          startDate: storedDateToKey(activity.startDate),
          endDate: activity.endDate ? storedDateToKey(activity.endDate) : "",
        }}
      />
    </div>
  );
}
