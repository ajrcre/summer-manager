"use client";

import { useState } from "react";
import { AVATAR_PRESETS, COLOR_PRESETS, ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/generated/prisma/enums";
import { createMemberAction } from "@/app/members/actions";

/** Inline form to add a new family member (avatar + color picker + role). */
export function MemberForm() {
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [role, setRole] = useState<Role>("VIEWER");

  return (
    <form
      action={async (fd) => {
        await createMemberAction(fd);
        (document.getElementById("member-name") as HTMLInputElement).value = "";
      }}
      className="space-y-3 rounded-3xl bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="avatar" value={avatar} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="role" value={role} />

      <input
        id="member-name"
        name="name"
        required
        placeholder="שם"
        className="w-full rounded-2xl border-2 border-violet-100 px-4 py-2.5 outline-none focus:border-brand"
      />

      <div>
        <p className="mb-1 text-sm font-bold text-ink">בחרו דמות</p>
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_PRESETS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setAvatar(a)}
              className={`grid h-10 w-10 place-items-center rounded-xl text-2xl ${
                avatar === a ? "bg-brand-soft ring-2 ring-brand" : "bg-slate-50"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-bold text-ink">צבע</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full ${
                color === c ? "ring-2 ring-offset-2 ring-ink" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {(["VIEWER", "EDITOR"] as Role[]).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRole(r)}
            className={`flex-1 rounded-full border-2 py-2 font-bold ${
              role === r
                ? "border-transparent bg-brand text-white"
                : "border-violet-100 text-ink"
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <button className="w-full rounded-full bg-brand py-3 font-bold text-white">
        הוספה
      </button>
    </form>
  );
}
