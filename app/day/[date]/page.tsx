import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOccurrencesForDay } from "@/lib/activities";
import { toCardData } from "@/lib/cardData";
import { addDaysKey, todayKey } from "@/lib/dates";
import { formatDateHebrew } from "@/lib/format";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const dayKey = KEY_RE.test(date) ? date : todayKey();
  const prev = addDaysKey(dayKey, -1);
  const next = addDaysKey(dayKey, 1);
  const today = todayKey();

  const occ = await getOccurrencesForDay(dayKey);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl bg-white p-2 shadow-sm">
        <Link
          href={`/day/${prev}`}
          aria-label="יום קודם"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight size={22} />
        </Link>
        <div className="text-center">
          <p className="font-extrabold text-ink">{formatDateHebrew(dayKey)}</p>
          {dayKey !== today && (
            <Link href={`/day/${today}`} className="text-xs font-semibold text-brand">
              חזרה להיום
            </Link>
          )}
        </div>
        <Link
          href={`/day/${next}`}
          aria-label="יום הבא"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft size={22} />
        </Link>
      </div>

      {occ.length === 0 ? (
        <EmptyState emoji="🗓️" title="אין פעילויות ביום זה" />
      ) : (
        <div className="space-y-2.5">
          {occ.map((o) => (
            <ActivityCard
              key={`${o.activity.id}-${o.dateKey}`}
              data={toCardData(o, { withAssignee: true })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
