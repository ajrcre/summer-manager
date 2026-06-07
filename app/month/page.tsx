import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOccurrencesForRange } from "@/lib/activities";
import { ACTIVITY_TYPES, DAY_NAMES_SHORT } from "@/lib/constants";
import {
  addDaysKey,
  endOfMonthKey,
  rangeKeys,
  startOfMonthKey,
  startOfWeekKey,
  todayKey,
} from "@/lib/dates";
import { formatMonthHebrew } from "@/lib/format";
import type { ActivityType } from "@/generated/prisma/enums";
import { getMembers } from "@/lib/members";
import { CalendarFilters } from "@/components/CalendarFilters";

export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-\d{2}$/;

function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function MonthPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; member?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const today = todayKey();
  const monthKey =
    sp.month && MONTH_RE.test(sp.month) ? sp.month : today.slice(0, 7);

  const monthStart = startOfMonthKey(`${monthKey}-01`);
  const monthEnd = endOfMonthKey(monthStart);
  const gridStart = startOfWeekKey(monthStart);
  const gridEnd = addDaysKey(startOfWeekKey(monthEnd), 6);
  const cells = rangeKeys(gridStart, gridEnd);

  const type =
    sp.type && sp.type in ACTIVITY_TYPES ? (sp.type as ActivityType) : undefined;
  const members = await getMembers();
  const occ = await getOccurrencesForRange(gridStart, gridEnd, {
    memberId: sp.member || undefined,
    type,
  });

  const qs = (month: string) => {
    const p = new URLSearchParams();
    p.set("month", month);
    if (sp.member) p.set("member", sp.member);
    if (sp.type) p.set("type", sp.type);
    return `/month?${p.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl bg-white p-2 shadow-sm">
        <Link
          href={qs(shiftMonth(monthKey, -1))}
          aria-label="חודש קודם"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight size={22} />
        </Link>
        <p className="text-center text-lg font-extrabold text-ink">
          {formatMonthHebrew(monthStart)}
        </p>
        <Link
          href={qs(shiftMonth(monthKey, 1))}
          aria-label="חודש הבא"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft size={22} />
        </Link>
      </div>

      <CalendarFilters members={members} basePath="/month" />

      <div className="rounded-3xl bg-white p-2 shadow-sm">
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400">
          {DAY_NAMES_SHORT.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((key) => {
            const inMonth = key.slice(0, 7) === monthKey;
            const isToday = key === today;
            const dayOcc = occ.filter((o) => o.dateKey === key);
            const types = [...new Set(dayOcc.map((o) => o.activity.type))].slice(
              0,
              4,
            );
            return (
              <Link
                key={key}
                href={`/day/${key}`}
                className={`flex aspect-square flex-col items-center justify-start rounded-xl p-1 ${
                  inMonth ? "" : "opacity-30"
                } ${isToday ? "bg-brand text-white" : "hover:bg-violet-50"}`}
              >
                <span className="text-sm font-bold">{Number(key.slice(8))}</span>
                <span className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {types.map((t) => (
                    <span
                      key={t}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ACTIVITY_TYPES[t].color }}
                    />
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
