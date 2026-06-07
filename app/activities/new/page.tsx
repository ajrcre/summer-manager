import { redirect } from "next/navigation";
import { isEditor } from "@/lib/auth";
import { todayKey } from "@/lib/dates";
import { getMembers, getViewers } from "@/lib/members";
import { ActivityForm } from "@/components/ActivityForm";

export const dynamic = "force-dynamic";

export default async function NewActivityPage() {
  if (!(await isEditor())) redirect("/unlock");

  const members = await getMembers();
  const viewers = await getViewers();
  const defaultMember = viewers[0]?.id ?? members[0]?.id ?? "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ink">פעילות חדשה</h1>
      <ActivityForm
        members={members}
        defaults={{
          title: "",
          description: "",
          type: "CHORE",
          assignedToId: defaultMember,
          points: "0",
          timeStart: "",
          timeEnd: "",
          recurrence: "DAILY",
          daysOfWeek: [],
          startDate: todayKey(),
          endDate: "",
        }}
      />
    </div>
  );
}
