import { getGoalsForMember, getMemberActivities } from "@/lib/goals";
import { getCurrentMember, getMembers } from "@/lib/members";
import { EmptyState } from "@/components/EmptyState";
import { GoalCard, type GoalCardActivity } from "@/components/GoalCard";
import { GoalForm } from "@/components/GoalForm";
import { MemberSwitcher } from "@/components/MemberSwitcher";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const members = await getMembers();
  const current = await getCurrentMember();

  if (!current) {
    return (
      <EmptyState
        emoji="🎯"
        title="עדיין אין בני משפחה"
        hint="הוסיפו בני משפחה כדי להגדיר מטרות"
        cta={{ href: "/members", label: "הוספת בני משפחה" }}
      />
    );
  }

  const [goals, memberActivities] = await Promise.all([
    getGoalsForMember(current.id),
    getMemberActivities(current.id),
  ]);

  const pickerActivities: GoalCardActivity[] = memberActivities.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    goalId: a.goalId,
  }));

  return (
    <div className="space-y-5">
      <MemberSwitcher members={members} currentId={current.id} />

      <div>
        <h1 className="text-2xl font-extrabold text-ink">
          המטרות של {current.avatar} {current.name}
        </h1>
        <p className="text-sm text-slate-500">
          הגדירו מטרות לקיץ ושייכו אליהן פעילויות
        </p>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="עדיין אין מטרות"
          hint="הוסיפו את המטרה הראשונה שלכם למטה"
        />
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={{
                id: g.id,
                title: g.title,
                description: g.description,
                completionCount: g.completionCount,
                linked: g.activities.map((a) => ({
                  id: a.id,
                  title: a.title,
                  type: a.type,
                  goalId: a.goalId,
                })),
              }}
              memberActivities={pickerActivities}
            />
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-extrabold text-ink">מטרה חדשה</h2>
        <GoalForm memberId={current.id} />
      </div>
    </div>
  );
}
