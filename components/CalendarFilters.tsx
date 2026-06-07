"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FamilyMember } from "@/generated/prisma/client";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_ORDER } from "@/lib/constants";

type Props = {
  members: FamilyMember[];
  basePath: string;
};

/** Member + activity-type filters that drive ?member= and ?type= query params. */
export function CalendarFilters({ members, basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const member = params.get("member") ?? "";
  const type = params.get("type") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${basePath}?${next.toString()}`);
  }

  const selectClass =
    "rounded-full border border-violet-100 bg-white px-3 py-1.5 text-sm font-semibold text-ink";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={member}
        onChange={(e) => update("member", e.target.value)}
        className={selectClass}
      >
        <option value="">כל המשפחה</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.avatar} {m.name}
          </option>
        ))}
      </select>
      <select
        value={type}
        onChange={(e) => update("type", e.target.value)}
        className={selectClass}
      >
        <option value="">כל הסוגים</option>
        {ACTIVITY_TYPE_ORDER.map((t) => (
          <option key={t} value={t}>
            {ACTIVITY_TYPES[t].emoji} {ACTIVITY_TYPES[t].label}
          </option>
        ))}
      </select>
    </div>
  );
}
