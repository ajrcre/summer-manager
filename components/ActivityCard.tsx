"use client";

import { useState, useTransition } from "react";
import { Check, Star } from "lucide-react";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { ActivityType } from "@/generated/prisma/enums";
import { toggleCompletionAction } from "@/app/actions";

export type ActivityCardData = {
  activityId: string;
  title: string;
  description?: string | null;
  type: ActivityType;
  timeStart?: string | null;
  timeEnd?: string | null;
  points: number;
  dateKey: string;
  completedBy: string; // memberId credited when completed
  completed: boolean;
  open: boolean; // true when unassigned — anyone can claim it by completing it
  // Optional assignee chip (used in family-wide views)
  assignee?: { name: string; avatar: string | null; color: string } | null;
};

function timeText(start?: string | null, end?: string | null): string | null {
  if (!start) return null;
  return end ? `${start}–${end}` : start;
}

export function ActivityCard({ data }: { data: ActivityCardData }) {
  const [completed, setCompleted] = useState(data.completed);
  const [pending, startTransition] = useTransition();
  const meta = ACTIVITY_TYPES[data.type];
  const time = timeText(data.timeStart, data.timeEnd);

  function toggle() {
    const next = !completed;
    setCompleted(next); // optimistic
    startTransition(async () => {
      const result = await toggleCompletionAction(
        data.activityId,
        data.dateKey,
        data.completedBy,
      );
      setCompleted(result);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`flex w-full items-center gap-3 rounded-3xl border-2 p-3 text-right transition ${
        completed
          ? "border-green-200 bg-green-50"
          : "border-transparent bg-white shadow-sm"
      }`}
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
        style={{ backgroundColor: meta.bg }}
      >
        {meta.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`truncate text-lg font-extrabold ${
              completed ? "text-green-700 line-through" : "text-ink"
            }`}
          >
            {data.title}
          </span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          {time && <span className="font-semibold">🕒 {time}</span>}
          <span>{meta.label}</span>
          {data.points > 0 && (
            <span className="flex items-center gap-0.5 font-semibold text-amber-500">
              <Star size={14} fill="currentColor" />
              {data.points}
            </span>
          )}
          {data.open ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              🙋 פתוח לכולם
            </span>
          ) : (
            data.assignee && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                <span>{data.assignee.avatar ?? "🙂"}</span>
                {data.assignee.name}
              </span>
            )
          )}
        </span>
      </span>

      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition ${
          completed
            ? "animate-pop border-green-500 bg-green-500 text-white"
            : "border-slate-300 text-transparent"
        }`}
      >
        <Check size={22} strokeWidth={3} />
      </span>
    </button>
  );
}
