import { buildIcs } from "@/lib/ics";
import { prisma } from "@/lib/prisma";

/** Export a whole schedule as .ics. Optional ?member=<id> filters to one member. */
export async function GET(req: Request) {
  const memberId = new URL(req.url).searchParams.get("member");
  const activities = await prisma.activity.findMany({
    where: memberId ? { assignedToId: memberId } : {},
  });

  const ics = buildIcs(activities);
  const suffix = memberId ? `-${memberId}` : "";
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="summer-schedule${suffix}.ics"`,
    },
  });
}
