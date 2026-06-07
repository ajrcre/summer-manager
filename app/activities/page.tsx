import Link from "next/link";
import { CalendarPlus, Copy, Pencil, Plus, Trash2, Users } from "lucide-react";
import { isEditor } from "@/lib/auth";
import { ACTIVITY_TYPES, RECURRENCE_LABELS } from "@/lib/constants";
import { getMembers } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { deleteActivityAction, duplicateActivityAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  if (!(await isEditor())) {
    return (
      <EmptyState
        emoji="🔒"
        title="אזור ההורים נעול"
        hint="הזינו את קוד המשפחה כדי לנהל פעילויות"
        cta={{ href: "/unlock", label: "כניסת הורים" }}
      />
    );
  }

  const members = await getMembers();
  const activities = await prisma.activity.findMany({
    include: { assignedTo: true },
    orderBy: [{ assignedToId: "asc" }, { timeStart: "asc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">ניהול פעילויות</h1>
        <Link
          href="/activities/new"
          className="flex items-center gap-1 rounded-full bg-brand px-4 py-2 font-bold text-white"
        >
          <Plus size={18} /> חדשה
        </Link>
      </div>

      {/* Editor sub-navigation */}
      <div className="flex gap-2">
        <span className="rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand">
          פעילויות
        </span>
        <Link
          href="/members"
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-ink shadow-sm"
        >
          <Users size={16} /> בני משפחה
        </Link>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="עדיין אין פעילויות"
          hint="הוסיפו את הפעילות הראשונה"
          cta={{ href: "/activities/new", label: "יצירת פעילות" }}
        />
      ) : (
        <div className="space-y-5">
          {members.map((m) => {
            const list = activities.filter((a) => a.assignedToId === m.id);
            if (list.length === 0) return null;
            return (
              <section key={m.id} className="space-y-2">
                <h2 className="font-extrabold text-ink">
                  {m.avatar} {m.name}
                </h2>
                {list.map((a) => {
                  const meta = ACTIVITY_TYPES[a.type];
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                    >
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl"
                        style={{ backgroundColor: meta.bg }}
                      >
                        {meta.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{a.title}</p>
                        <p className="text-xs text-slate-500">
                          {a.timeStart && `${a.timeStart} · `}
                          {RECURRENCE_LABELS[a.recurrence]}
                          {a.points > 0 && ` · ${a.points} נק׳`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <a
                          href={`/api/ics/${a.id}`}
                          aria-label="ייצוא ליומן"
                          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                        >
                          <CalendarPlus size={17} />
                        </a>
                        <Link
                          href={`/activities/${a.id}/edit`}
                          aria-label="עריכה"
                          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                        </Link>
                        <form action={duplicateActivityAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            aria-label="שכפול"
                            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                          >
                            <Copy size={17} />
                          </button>
                        </form>
                        <form action={deleteActivityAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            aria-label="מחיקה"
                            className="grid h-9 w-9 place-items-center rounded-full text-red-400 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
