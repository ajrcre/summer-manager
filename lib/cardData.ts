import type { Occurrence } from "@/lib/activities";
import type { ActivityCardData } from "@/components/ActivityCard";

/** Map an Occurrence to the serializable shape ActivityCard expects. */
export function toCardData(
  occ: Occurrence,
  opts: { withAssignee?: boolean; currentMemberId?: string } = {},
): ActivityCardData {
  return {
    activityId: occ.activity.id,
    title: occ.activity.title,
    description: occ.activity.description,
    type: occ.activity.type,
    timeStart: occ.activity.timeStart,
    timeEnd: occ.activity.timeEnd,
    points: occ.activity.points,
    dateKey: occ.dateKey,
    completedBy: occ.activity.assignedToId ?? opts.currentMemberId ?? "",
    completed: occ.completion !== null,
    open: occ.activity.assignedToId === null,
    assignee:
      opts.withAssignee && occ.activity.assignedTo
        ? {
            name: occ.activity.assignedTo.name,
            avatar: occ.activity.assignedTo.avatar,
            color: occ.activity.assignedTo.color,
          }
        : null,
  };
}
