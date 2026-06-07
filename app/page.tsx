import Link from "next/link";
import { Bell, CheckCircle2, ListTodo, Star } from "lucide-react";
import { getOccurrencesForRange } from "@/lib/activities";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { addDaysKey, nowTime, todayKey } from "@/lib/dates";
import { formatDateHebrew } from "@/lib/format";
import { getMembers, getViewers } from "@/lib/members";
import { getPointsForMembers } from "@/lib/points";
import { EmptyState } from "@/components/EmptyState";
import { ProgressRing } from "@/components/ProgressRing";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const members = await getMembers();
  if (members.length === 0) {
    return (
      <EmptyState
        emoji="👋"
        title="ברוכים הבאים למתכנן הקיץ!"
        hint="נתחיל בהוספת בני המשפחה"
        cta={{ href: "/members", label: "הוספת בני משפחה" }}
      />
    );
  }

  const today = todayKey();
  const now = nowTime();
  const viewers = await getViewers();
  const points = await getPointsForMembers(members.map((m) => m.id));

  const todayOcc = await getOccurrencesForRange(today, today);
  const completedToday = todayOcc.filter((o) => o.completion);
  const remainingToday = todayOcc.filter((o) => !o.completion);
  const nextUp = remainingToday.find(
    (o) => o.activity.timeStart && o.activity.timeStart >= now,
  );

  const weekOcc = await getOccurrencesForRange(
    addDaysKey(today, 1),
    addDaysKey(today, 7),
  );
  const upcomingDays = [...new Set(weekOcc.map((o) => o.dateKey))].slice(0, 7);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-400">{formatDateHebrew(today)}</p>
        <h1 className="text-2xl font-extrabold text-ink">סקירה משפחתית</h1>
      </header>

      {nextUp && (
        <div className="flex items-center gap-3 rounded-3xl bg-brand-soft p-4">
          <Bell className="text-brand" />
          <div>
            <p className="text-sm font-semibold text-brand">הפעילות הבאה</p>
            <p className="font-bold text-ink">
              {ACTIVITY_TYPES[nextUp.activity.type].emoji} {nextUp.activity.title}{" "}
              · {nextUp.activity.timeStart} · {nextUp.activity.assignedTo.name}
            </p>
          </div>
        </div>
      )}

      {/* Today's summary */}
      <section className="grid grid-cols-3 gap-2">
        <SummaryStat
          icon={<ListTodo className="text-sky-500" />}
          value={todayOcc.length}
          label="פעילויות היום"
        />
        <SummaryStat
          icon={<CheckCircle2 className="text-green-500" />}
          value={completedToday.length}
          label="הושלמו"
        />
        <SummaryStat
          icon={<ListTodo className="text-amber-500" />}
          value={remainingToday.length}
          label="נותרו"
        />
      </section>

      {/* Family progress */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-ink">התקדמות הילדים</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {viewers.map((v) => {
            const dayOcc = todayOcc.filter(
              (o) => o.activity.assignedToId === v.id,
            );
            const done = dayOcc.filter((o) => o.completion).length;
            const pct =
              dayOcc.length === 0
                ? 0
                : Math.round((done / dayOcc.length) * 100);
            return (
              <div
                key={v.id}
                className="flex flex-col items-center gap-2 rounded-3xl bg-white p-3 text-center shadow-sm"
              >
                <ProgressRing
                  percent={pct}
                  size={84}
                  color={v.color}
                  label={`${pct}%`}
                />
                <p className="font-bold text-ink">
                  {v.avatar} {v.name}
                </p>
                <p className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                  <Star size={14} fill="currentColor" />
                  {points.get(v.id)?.total ?? 0} נק׳
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming 7 days */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-ink">השבוע הקרוב</h2>
        {upcomingDays.length === 0 ? (
          <EmptyState emoji="🌞" title="אין אירועים מתוכננים בשבוע הקרוב" />
        ) : (
          <div className="space-y-2">
            {upcomingDays.map((key) => {
              const dayOcc = weekOcc.filter((o) => o.dateKey === key);
              return (
                <Link
                  key={key}
                  href={`/day/${key}`}
                  className="block rounded-2xl bg-white p-3 shadow-sm"
                >
                  <p className="text-sm font-bold text-brand">
                    {formatDateHebrew(key)}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
                    {dayOcc.slice(0, 6).map((o) => (
                      <span key={`${o.activity.id}-${o.dateKey}`}>
                        {ACTIVITY_TYPES[o.activity.type].emoji}{" "}
                        {o.activity.timeStart && `${o.activity.timeStart} `}
                        {o.activity.title}
                      </span>
                    ))}
                    {dayOcc.length > 6 && <span>ועוד…</span>}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-3xl bg-white p-3 text-center shadow-sm">
      {icon}
      <span className="text-2xl font-extrabold text-ink">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
