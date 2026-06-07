import { isEditor } from "@/lib/auth";
import { UnlockForm } from "./UnlockForm";
import { lockAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function UnlockPage() {
  const editor = await isEditor();

  if (editor) {
    return (
      <div className="mx-auto max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-sm">
        <p className="text-5xl">🔓</p>
        <h1 className="text-xl font-extrabold text-ink">מצב הורה פעיל</h1>
        <p className="text-slate-500">
          ניתן ליצור, לערוך ולמחוק פעילויות, פרסים ובני משפחה.
        </p>
        <form action={lockAction}>
          <button className="w-full rounded-full bg-slate-100 py-3 font-bold text-slate-700">
            נעילה (חזרה למצב צפייה)
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-sm">
      <p className="text-5xl">🔒</p>
      <h1 className="text-xl font-extrabold text-ink">כניסת הורים</h1>
      <p className="text-slate-500">הזינו את קוד המשפחה כדי לנהל את התוכן</p>
      <UnlockForm />
    </div>
  );
}
