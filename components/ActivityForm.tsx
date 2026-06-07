"use client";

import { useState } from "react";
import type { FamilyMember } from "@/generated/prisma/client";
import type { ActivityType, RecurrenceType } from "@/generated/prisma/enums";
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_ORDER,
  DAY_NAMES,
  RECURRENCE_LABELS,
} from "@/lib/constants";
import {
  createActivityAction,
  updateActivityAction,
} from "@/app/activities/actions";

export type ActivityFormDefaults = {
  id?: string;
  title: string;
  description: string;
  type: ActivityType;
  assignedToId: string;
  points: string;
  timeStart: string;
  timeEnd: string;
  recurrence: RecurrenceType;
  daysOfWeek: number[];
  startDate: string;
  endDate: string;
};

const RECURRENCES: RecurrenceType[] = [
  "NONE",
  "DAILY",
  "WEEKDAYS",
  "WEEKLY",
  "CUSTOM",
];

const labelClass = "block text-sm font-bold text-ink mb-1";
const inputClass =
  "w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 focus:border-brand outline-none";

export function ActivityForm({
  members,
  defaults,
}: {
  members: FamilyMember[];
  defaults: ActivityFormDefaults;
}) {
  const isEdit = Boolean(defaults.id);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    defaults.recurrence,
  );
  const showDays = recurrence === "WEEKLY" || recurrence === "CUSTOM";

  return (
    <form
      action={isEdit ? updateActivityAction : createActivityAction}
      className="space-y-4"
    >
      {isEdit && <input type="hidden" name="id" value={defaults.id} />}

      <div>
        <label className={labelClass}>שם הפעילות</label>
        <input
          name="title"
          required
          defaultValue={defaults.title}
          placeholder="לדוגמה: סידור מיטה"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>תיאור (אופציונלי)</label>
        <input
          name="description"
          defaultValue={defaults.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>סוג</label>
          <select name="type" defaultValue={defaults.type} className={inputClass}>
            {ACTIVITY_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_TYPES[t].emoji} {ACTIVITY_TYPES[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>משויך ל-</label>
          <select
            name="assignedToId"
            defaultValue={defaults.assignedToId}
            required
            className={inputClass}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>שעת התחלה</label>
          <input
            type="time"
            name="timeStart"
            defaultValue={defaults.timeStart}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>שעת סיום</label>
          <input
            type="time"
            name="timeEnd"
            defaultValue={defaults.timeEnd}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>נקודות</label>
          <input
            type="number"
            name="points"
            min={0}
            defaultValue={defaults.points}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>חזרתיות</label>
        <select
          name="recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
          className={inputClass}
        >
          {RECURRENCES.map((r) => (
            <option key={r} value={r}>
              {RECURRENCE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {showDays && (
        <div>
          <label className={labelClass}>בימים</label>
          <div className="flex flex-wrap gap-1.5">
            {DAY_NAMES.map((name, idx) => (
              <label
                key={idx}
                className="cursor-pointer select-none rounded-full border-2 border-violet-100 px-3 py-1.5 text-sm font-semibold has-[:checked]:border-transparent has-[:checked]:bg-brand has-[:checked]:text-white"
              >
                <input
                  type="checkbox"
                  name="daysOfWeek"
                  value={idx}
                  defaultChecked={defaults.daysOfWeek.includes(idx)}
                  className="hidden"
                />
                {name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>מתאריך</label>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={defaults.startDate}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>עד תאריך (אופציונלי)</label>
          <input
            type="date"
            name="endDate"
            defaultValue={defaults.endDate}
            className={inputClass}
          />
        </div>
      </div>

      <button className="w-full rounded-full bg-brand py-3 font-bold text-white">
        {isEdit ? "שמירת שינויים" : "יצירת פעילות"}
      </button>
    </form>
  );
}
