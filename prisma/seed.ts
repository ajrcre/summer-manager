import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import type { ActivityType, RecurrenceType } from "../generated/prisma/enums";

type SeedActivity = {
  title: string;
  type: ActivityType;
  recurrence: RecurrenceType;
  points: number;
  assignedToId: string;
  timeStart?: string;
  timeEnd?: string;
  description?: string;
  daysOfWeek?: number[];
  startDate?: Date;
  endDate?: Date | null;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const d = (key: string) => new Date(`${key}T00:00:00.000Z`);
const SUMMER_START = "2026-06-01";
const SUMMER_END = "2026-08-31";

async function main() {
  // Clean slate (safe for a dev seed).
  await prisma.completion.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.familyMember.deleteMany();

  const abba = await prisma.familyMember.create({
    data: { name: "אבא", avatar: "👨", color: "#6366f1", role: "EDITOR" },
  });
  const ima = await prisma.familyMember.create({
    data: { name: "אמא", avatar: "👩", color: "#ec4899", role: "EDITOR" },
  });
  const ariel = await prisma.familyMember.create({
    data: { name: "אריאל", avatar: "🦊", color: "#f59e0b", role: "VIEWER" },
  });
  const rotem = await prisma.familyMember.create({
    data: { name: "רותם", avatar: "🐻", color: "#0ea5e9", role: "VIEWER" },
  });
  const tal = await prisma.familyMember.create({
    data: { name: "טל", avatar: "🦁", color: "#22c55e", role: "VIEWER" },
  });
  const noa = await prisma.familyMember.create({
    data: { name: "נועה", avatar: "🐼", color: "#a855f7", role: "VIEWER" },
  });

  void abba;
  void ima;

  const base = {
    startDate: d(SUMMER_START),
    endDate: d(SUMMER_END),
    daysOfWeek: [] as number[],
  };

  const activities: SeedActivity[] = [
    // אריאל
    { title: "סידור מיטה", type: "CHORE", recurrence: "DAILY", points: 5, timeStart: "08:00", assignedToId: ariel.id },
    { title: "קייטנת כדורגל", type: "CAMP", recurrence: "WEEKDAYS", points: 0, timeStart: "08:30", timeEnd: "13:30", assignedToId: ariel.id },
    { title: "קריאה", type: "LEARNING", recurrence: "WEEKDAYS", points: 10, timeStart: "16:00", assignedToId: ariel.id, description: "20 דקות קריאה" },
    // רותם
    { title: "סידור מיטה", type: "CHORE", recurrence: "DAILY", points: 5, timeStart: "08:00", assignedToId: rotem.id },
    { title: "דף עבודה בחשבון", type: "LEARNING", recurrence: "WEEKDAYS", points: 10, timeStart: "11:00", assignedToId: rotem.id },
    { title: "נינטנדו", type: "SCREEN_TIME", recurrence: "DAILY", points: 0, timeStart: "18:00", assignedToId: rotem.id },
    // טל
    { title: "האכלת הכלב", type: "CHORE", recurrence: "DAILY", points: 5, timeStart: "08:30", assignedToId: tal.id },
    { title: "שיעור שחייה", type: "APPOINTMENT", recurrence: "WEEKLY", points: 0, timeStart: "16:00", daysOfWeek: [2], assignedToId: tal.id },
    { title: "זמן טלוויזיה", type: "SCREEN_TIME", recurrence: "DAILY", points: 0, timeStart: "17:00", assignedToId: tal.id },
    // נועה
    { title: "קריאה", type: "LEARNING", recurrence: "WEEKDAYS", points: 10, timeStart: "10:00", assignedToId: noa.id, description: "20 דקות קריאה" },
    { title: "קייטנת קיץ", type: "CAMP", recurrence: "WEEKDAYS", points: 0, timeStart: "08:30", timeEnd: "13:30", assignedToId: noa.id },
    { title: "זמן חופשי בפארק", type: "FREE_TIME", recurrence: "WEEKLY", points: 0, timeStart: "15:00", daysOfWeek: [5], assignedToId: noa.id },
    { title: "תור לרופא שיניים", type: "APPOINTMENT", recurrence: "NONE", points: 0, timeStart: "09:30", startDate: d("2026-06-09"), endDate: null, assignedToId: noa.id },
  ];

  const created = [];
  for (const a of activities) {
    created.push(
      await prisma.activity.create({
        data: {
          ...base,
          ...a,
        },
      }),
    );
  }

  // Sample goal for נועה, linked to her reading activity.
  const reading = created.find(
    (a) => a.title === "קריאה" && a.assignedToId === noa.id,
  );
  const goal = await prisma.goal.create({
    data: {
      title: "לקרוא 5 ספרים בקיץ",
      description: "ספר אחד כל שבוע בערך",
      memberId: noa.id,
    },
  });
  if (reading) {
    await prisma.activity.update({
      where: { id: reading.id },
      data: { goalId: goal.id },
    });
  }

  await prisma.reward.createMany({
    data: [
      { name: "חצי שעה טלוויזיה נוספת", description: "30 דקות מסך בונוס", pointCost: 30 },
      { name: "גלידה", description: "יציאה לגלידה", pointCost: 50 },
      { name: "בחירת סרט לערב משפחתי", description: "אתם בוחרים מה רואים", pointCost: 40 },
      { name: "יציאה לפארק שעשועים", description: "בילוי בפארק", pointCost: 100 },
    ],
  });

  console.log("✅ Seed complete: 6 members, 13 activities, 4 rewards, 1 goal");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
