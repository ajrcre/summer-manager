"use client";

import { createGoalAction } from "@/app/goals/actions";

const inputClass =
  "w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 outline-none focus:border-brand";

/** Inline form for a child to add a new free-text goal. */
export function GoalForm({ memberId }: { memberId: string }) {
  return (
    <form
      id="goal-form"
      action={async (fd) => {
        await createGoalAction(fd);
        (document.getElementById("goal-form") as HTMLFormElement)?.reset();
      }}
      className="space-y-3 rounded-3xl bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="memberId" value={memberId} />
      <input
        name="title"
        required
        placeholder="המטרה שלי… (לדוגמה: לקרוא 5 ספרים)"
        className={inputClass}
      />
      <input
        name="description"
        placeholder="פרטים (אופציונלי)"
        className={inputClass}
      />
      <button className="w-full rounded-full bg-brand py-3 font-bold text-white">
        הוספת מטרה
      </button>
    </form>
  );
}
