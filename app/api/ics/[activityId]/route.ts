import { buildIcs } from "@/lib/ics";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const { activityId } = await params;
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });
  if (!activity) {
    return new Response("Not found", { status: 404 });
  }

  const ics = buildIcs([activity]);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="activity-${activityId}.ics"`,
    },
  });
}
