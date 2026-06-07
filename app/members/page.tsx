import Link from "next/link";
import { ListChecks, Trash2 } from "lucide-react";
import { isEditor } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { getMembers } from "@/lib/members";
import { EmptyState } from "@/components/EmptyState";
import { MemberForm } from "@/components/MemberForm";
import { deleteMemberAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  if (!(await isEditor())) {
    return (
      <EmptyState
        emoji="🔒"
        title="אזור ההורים נעול"
        hint="הזינו את קוד המשפחה כדי לנהל בני משפחה"
        cta={{ href: "/unlock", label: "כניסת הורים" }}
      />
    );
  }

  const members = await getMembers();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ink">בני המשפחה</h1>

      {/* Editor sub-navigation */}
      <div className="flex gap-2">
        <Link
          href="/activities"
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-ink shadow-sm"
        >
          <ListChecks size={16} /> פעילויות
        </Link>
        <span className="rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand">
          בני משפחה
        </span>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-full text-2xl text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.avatar}
            </span>
            <div className="flex-1">
              <p className="font-bold text-ink">{m.name}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[m.role]}</p>
            </div>
            <form action={deleteMemberAction}>
              <input type="hidden" name="id" value={m.id} />
              <button
                aria-label="מחיקה"
                className="grid h-9 w-9 place-items-center rounded-full text-red-400 hover:bg-red-50"
              >
                <Trash2 size={17} />
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="pt-2 text-lg font-extrabold text-ink">הוספת בן/בת משפחה</h2>
      <MemberForm />
    </div>
  );
}
