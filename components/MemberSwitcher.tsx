"use client";

import { useTransition } from "react";
import type { FamilyMember } from "@/generated/prisma/client";
import { switchMemberAction } from "@/app/actions";

type Props = {
  members: FamilyMember[];
  currentId: string;
};

/** Horizontal avatar picker to switch the focused family member. */
export function MemberSwitcher({ members, currentId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {members.map((m) => {
        const active = m.id === currentId;
        return (
          <button
            key={m.id}
            disabled={pending}
            onClick={() => startTransition(() => switchMemberAction(m.id))}
            className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
              active
                ? "border-transparent text-white shadow-sm"
                : "border-violet-100 bg-white text-ink"
            }`}
            style={active ? { backgroundColor: m.color } : undefined}
          >
            <span className="text-lg leading-none">{m.avatar ?? "🙂"}</span>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}
