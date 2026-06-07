"use client";

import { createRewardAction } from "@/app/rewards/actions";

const inputClass =
  "w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 outline-none focus:border-brand";

export function RewardForm() {
  return (
    <form
      action={async (fd) => {
        await createRewardAction(fd);
        (document.getElementById("reward-form") as HTMLFormElement)?.reset();
      }}
      id="reward-form"
      className="space-y-3 rounded-3xl bg-white p-4 shadow-sm"
    >
      <input name="name" required placeholder="שם הפרס" className={inputClass} />
      <input name="description" placeholder="תיאור (אופציונלי)" className={inputClass} />
      <input
        name="pointCost"
        type="number"
        min={0}
        required
        placeholder="עלות בנקודות"
        className={inputClass}
      />
      <button className="w-full rounded-full bg-brand py-3 font-bold text-white">
        הוספת פרס
      </button>
    </form>
  );
}
