"use client";

import { useActionState, useEffect } from "react";
import { unlockAction } from "./actions";

export function UnlockForm() {
  const [state, formAction, pending] = useActionState(unlockAction, {});

  useEffect(() => {
    if (state?.ok) {
      // Full reload (not router.push) so the cached layout/header and every
      // gated page re-render together with the new cookie — prevents the
      // "header says unlocked, page says locked" mismatch.
      window.location.assign("/activities");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        autoFocus
        placeholder="קוד משפחה"
        className="w-full rounded-2xl border-2 border-violet-100 px-4 py-3 text-center text-2xl tracking-widest"
      />
      {state?.error && (
        <p className="text-sm font-semibold text-red-500">{state.error}</p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-full bg-brand py-3 font-bold text-white disabled:opacity-60"
      >
        כניסה
      </button>
    </form>
  );
}
