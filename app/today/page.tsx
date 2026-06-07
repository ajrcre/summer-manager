import { getOccurrencesForDay } from "@/lib/activities";
import { toCardData } from "@/lib/cardData";
import { todayKey } from "@/lib/dates";
import { formatDateHebrew } from "@/lib/format";
import { getCurrentMember, getMembers } from "@/lib/members";
import { getMemberPoints } from "@/lib/points";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { MemberSwitcher } from "@/components/MemberSwitcher";
import { ProgressRing } from "@/components/ProgressRing";
import { ShareToWhatsApp } from "@/components/ShareToWhatsApp";
import { CalendarPlus, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const members = await getMembers();
  const current = await getCurrentMember();

  if (!current) {
    return (
      <EmptyState
        emoji="👨‍👩‍👧‍👦"
        title="עדיין אין בני משפחה"
        hint="הוסיפו הורים וילדים כדי להתחיל"
        cta={{ href: "/members", label: "הוספת בני משפחה" }}
      />
    );
  }

  const today = todayKey();
  const occ = await getOccurrencesForDay(today, { memberId: current.id });
  const points = await getMemberPoints(current.id);
  const completedCount = occ.filter((o) => o.completion).length;
  const percent =
    occ.length === 0 ? 0 : Math.round((completedCount / occ.length) * 100);

  return (
    <div className="space-y-5">
      <MemberSwitcher members={members} currentId={current.id} />

      <section className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
        <ProgressRing
          percent={percent}
          color={current.color}
          label={`${completedCount}/${occ.length}`}
          sublabel="הושלמו"
        />
        <div className="flex-1">
          <p className="text-sm text-slate-400">{formatDateHebrew(today)}</p>
          <p className="text-2xl font-extrabold text-ink">
            {current.avatar} {current.name}
          </p>
          <p className="mt-1 text-slate-600">
            {occ.length === 0
              ? "אין משימות להיום 🎉"
              : `${completedCount} מתוך ${occ.length} משימות הושלמו`}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-600">
            <Star size={16} fill="currentColor" />
            {points.today} נקודות היום · {points.total} סה״כ
          </div>
        </div>
      </section>

      {occ.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          <a
            href={`/api/ics?member=${current.id}`}
            className="flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-sm active:scale-95"
          >
            <CalendarPlus size={16} />
            ייצוא ליומן
          </a>
          <ShareToWhatsApp
            memberName={current.name}
            dateLabel={formatDateHebrew(today)}
            lines={occ.map((o) => ({
              time: o.activity.timeStart,
              title: o.activity.title,
              done: o.completion !== null,
            }))}
          />
        </div>
      )}

      {occ.length === 0 ? (
        <EmptyState
          emoji="🌴"
          title="יום חופשי לגמרי!"
          hint="אין משימות מתוכננות להיום"
        />
      ) : (
        <div className="space-y-2.5">
          {occ.map((o) => (
            <ActivityCard
              key={`${o.activity.id}-${o.dateKey}`}
              data={toCardData(o)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
