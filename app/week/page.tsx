import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOccurrencesForRange } from "@/lib/activities";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { DAY_NAMES_SHORT } from "@/lib/constants";
import {
  addDaysKey,
  dayOfWeek,
  rangeKeys,
  startOfWeekKey,
  todayKey,
} from "@/lib/dates";
import { formatDateLong } from "@/lib/format";
import type { ActivityType } from "@/generated/prisma/enums";
import { getMembers } from "@/lib/members";
import { CalendarFilters } from "@/components/CalendarFilters";

export const dynamic = "force-dynamic";

const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; member?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const anchor = sp.start && KEY_RE.test(sp.start) ? sp.start : todayKey();
  const weekStart = startOfWeekKey(anchor);
  const weekEnd = addDaysKey(weekStart, 6);
  const days = rangeKeys(weekStart, weekEnd);
  const today = todayKey();

  const type =
    sp.type && sp.type in ACTIVITY_TYPES ? (sp.type as ActivityType) : undefined;
  const members = await getMembers();
  const occ = await getOccurrencesForRange(weekStart, weekEnd, {
    memberId: sp.member || undefined,
    type,
  });

  const prevStart = addDaysKey(weekStart, -7);
  const nextStart = addDaysKey(weekStart, 7);
  const qs = (start: string) => {
    const p = new URLSearchParams();
    p.set("start", start);
    if (sp.member) p.set("member", sp.member);
    if (sp.type) p.set("type", sp.type);
    return `/week?${p.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl bg-white p-2 shadow-sm">
        <Link
          href={qs(prevStart)}
          aria-label="שבוע קודם"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight size={22} />
        </Link>
        <p className="text-center font-extrabold text-ink">
          {formatDateLong(weekStart)} – {formatDateLong(weekEnd)}
        </p>
        <Link
          href={qs(nextStart)}
          aria-label="שבוע הבא"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft size={22} />
        </Link>
      </div>

      <CalendarFilters members={members} basePath="/week" />

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {days.map((key) => {
            const dayOcc = occ.filter((o) => o.dateKey === key);
            const isToday = key === today;
            return (
              <div key={key} className="flex flex-col">
                <Link
                  href={`/day/${key}`}
                  className={`mb-1.5 rounded-2xl px-1 py-1.5 text-center ${
                    isToday ? "bg-brand text-white" : "bg-violet-50 text-ink"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {DAY_NAMES_SHORT[dayOfWeek(key)]}
                  </div>
                  <div className="text-lg font-extrabold leading-tight">
                    {Number(key.slice(8))}
                  </div>
                </Link>
                <div className="space-y-1">
                  {dayOcc.map((o) => {
                    const meta = ACTIVITY_TYPES[o.activity.type];
                    return (
                      <Link
                        key={`${o.activity.id}-${o.dateKey}`}
                        href={`/day/${key}`}
                        className={`block rounded-lg border-r-4 px-1.5 py-1 text-[11px] leading-tight ${
                          o.completion ? "opacity-50 line-through" : ""
                        }`}
                        style={{ backgroundColor: meta.bg, borderColor: meta.color }}
                      >
                        {o.activity.timeStart && (
                          <span className="font-bold">
                            {o.activity.timeStart}{" "}
                          </span>
                        )}
                        {meta.emoji} {o.activity.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
