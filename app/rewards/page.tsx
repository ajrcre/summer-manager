import { Gift, Star, Trash2 } from "lucide-react";
import { isEditor } from "@/lib/auth";
import { getViewers } from "@/lib/members";
import { getPointsForMembers } from "@/lib/points";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { RewardForm } from "@/components/RewardForm";
import { deleteRewardAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const editor = await isEditor();
  const viewers = await getViewers();
  const points = await getPointsForMembers(viewers.map((v) => v.id));
  const rewards = await prisma.reward.findMany({ orderBy: { pointCost: "asc" } });
  const maxPoints = Math.max(
    0,
    ...viewers.map((v) => points.get(v.id)?.total ?? 0),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">פרסים ונקודות</h1>

      {/* Points dashboard */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {viewers.map((v) => {
          const p = points.get(v.id) ?? { total: 0, today: 0, week: 0 };
          return (
            <div
              key={v.id}
              className="rounded-3xl p-4 text-white shadow-sm"
              style={{ backgroundColor: v.color }}
            >
              <p className="text-lg font-extrabold">
                {v.avatar} {v.name}
              </p>
              <p className="mt-1 flex items-center gap-1 text-3xl font-black">
                <Star size={22} fill="currentColor" />
                {p.total}
              </p>
              <p className="mt-1 text-xs opacity-90">
                היום {p.today} · השבוע {p.week}
              </p>
            </div>
          );
        })}
      </section>

      {/* Rewards catalog */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-ink">חנות הפרסים</h2>
        {rewards.length === 0 ? (
          <EmptyState
            emoji="🎁"
            title="עדיין אין פרסים"
            hint={editor ? "הוסיפו פרס ראשון למטה" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((r) => {
              const affordable = maxPoints >= r.pointCost;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">
                    <Gift className="text-amber-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{r.name}</p>
                    {r.description && (
                      <p className="truncate text-sm text-slate-500">
                        {r.description}
                      </p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star size={14} fill="currentColor" />
                      {r.pointCost} נקודות
                      {affordable && (
                        <span className="mr-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                          ניתן להשגה!
                        </span>
                      )}
                    </p>
                  </div>
                  {editor && (
                    <form action={deleteRewardAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        aria-label="מחיקה"
                        className="grid h-9 w-9 place-items-center rounded-full text-red-400 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editor && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-ink">הוספת פרס</h2>
          <RewardForm />
        </section>
      )}
    </div>
  );
}
