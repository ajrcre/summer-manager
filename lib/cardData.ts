import type { Occurrence } from "@/lib/activities";
import type { ActivityCardData } from "@/components/ActivityCard";

/** Map an Occurrence to the serializable shape ActivityCard expects. */
export function toCardData(
  occ: Occurrence,
  opts: { withAssignee?: boolean } = {},
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
    completedBy: occ.activity.assignedToId,
    completed: occ.completion !== null,
    assignee: opts.withAssignee
      ? {
          name: occ.activity.assignedTo.name,
          avatar: occ.activity.assignedTo.avatar,
          color: occ.activity.assignedTo.color,
        }
      : null,
  };
}
