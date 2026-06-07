import { cookies } from "next/headers";
import type { FamilyMember } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const CURRENT_MEMBER_COOKIE = "sm_member";

export function getMembers(): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({ orderBy: { createdAt: "asc" } });
}

export function getMember(id: string): Promise<FamilyMember | null> {
  return prisma.familyMember.findUnique({ where: { id } });
}

export function getViewers(): Promise<FamilyMember[]> {
  return prisma.familyMember.findMany({
    where: { role: "VIEWER" },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * The member currently "in focus" (whose schedule the kid is looking at).
 * Falls back to the first viewer, then the first member. Returns null only if
 * there are no members at all.
 */
export async function getCurrentMember(): Promise<FamilyMember | null> {
  const selectedId = (await cookies()).get(CURRENT_MEMBER_COOKIE)?.value;
  const members = await getMembers();
  if (members.length === 0) return null;

  if (selectedId) {
    const found = members.find((m) => m.id === selectedId);
    if (found) return found;
  }
  return members.find((m) => m.role === "VIEWER") ?? members[0];
}

/** Server action: switch the focused member. */
export async function setCurrentMember(id: string): Promise<void> {
  (await cookies()).set(CURRENT_MEMBER_COOKIE, id, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
