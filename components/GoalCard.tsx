"use client";

import { useState, useTransition } from "react";
import { Check, Link2, Pencil, Target, Trash2, X } from "lucide-react";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { ActivityType } from "@/generated/prisma/enums";
import {
  deleteGoalAction,
  setActivityGoalAction,
  updateGoalAction,
} from "@/app/goals/actions";

export type GoalCardActivity = {
  id: string;
  title: string;
  type: ActivityType;
  goalId: string | null;
};

export type GoalCardData = {
  id: string;
  title: string;
  description: string | null;
  completionCount: number;
  linked: GoalCardActivity[];
};

export function GoalCard({
  goal,
  memberActivities,
}: {
  goal: GoalCardData;
  memberActivities: GoalCardActivity[];
}) {
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleLink(activityId: string, linkedHere: boolean) {
    startTransition(() =>
      setActivityGoalAction(activityId, linkedHere ? null : goal.id),
    );
  }

  if (editing) {
    return (
      <form
        action={async (fd) => {
          await updateGoalAction(fd);
          setEditing(false);
        }}
        className="space-y-3 rounded-3xl bg-white p-4 shadow-sm"
      >
        <input type="hidden" name="id" value={goal.id} />
        <input
          name="title"
          required
          defaultValue={goal.title}
          className="w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 outline-none focus:border-brand"
        />
        <input
          name="description"
          defaultValue={goal.description ?? ""}
          placeholder="פרטים (אופציונלי)"
          className="w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <button className="flex-1 rounded-full bg-brand py-2.5 font-bold text-white">
            שמירה
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full bg-slate-100 px-4 py-2.5 font-bold text-slate-600"
          >
            ביטול
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-2xl">
          <Target className="text-brand" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-ink">{goal.title}</p>
          {goal.description && (
            <p className="text-sm text-slate-500">{goal.description}</p>
          )}
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-600">
            <Check size={14} strokeWidth={3} />
            הושלם {goal.completionCount} פעמים
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            aria-label="עריכה"
            onClick={() => setEditing(true)}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <Pencil size={17} />
          </button>
          <form action={deleteGoalAction}>
            <input type="hidden" name="id" value={goal.id} />
            <button
              aria-label="מחיקה"
              className="grid h-9 w-9 place-items-center rounded-full text-red-400 hover:bg-red-50"
            >
              <Trash2 size={17} />
            </button>
          </form>
        </div>
      </div>

      {/* Linked activities */}
      {goal.linked.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {goal.linked.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold"
              style={{ backgroundColor: ACTIVITY_TYPES[a.type].bg }}
            >
              {ACTIVITY_TYPES[a.type].emoji} {a.title}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setPicking((p) => !p)}
        className="flex items-center gap-1.5 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700"
      >
        <Link2 size={16} />
        {picking ? "סגירה" : "שיוך פעילויות"}
      </button>

      {picking && (
        <div className="space-y-1.5 rounded-2xl bg-slate-50 p-2">
          {memberActivities.length === 0 && (
            <p className="p-2 text-sm text-slate-400">
              אין פעילויות לשייך. בקשו מהורה להוסיף פעילויות.
            </p>
          )}
          {memberActivities.map((a) => {
            const linkedHere = a.goalId === goal.id;
            const linkedElsewhere = a.goalId !== null && !linkedHere;
            return (
              <button
                key={a.id}
                disabled={pending}
                onClick={() => toggleLink(a.id, linkedHere)}
                className="flex w-full items-center gap-2 rounded-xl bg-white p-2 text-right"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
                    linkedHere
                      ? "border-brand bg-brand text-white"
                      : "border-slate-300 text-transparent"
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className="flex-1">
                  {ACTIVITY_TYPES[a.type].emoji} {a.title}
                </span>
                {linkedElsewhere && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <X size={12} /> משויך למטרה אחרת
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
