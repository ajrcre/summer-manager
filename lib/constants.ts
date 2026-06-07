import { ActivityType, RecurrenceType, Role } from "@/generated/prisma/enums";

export type ActivityMeta = {
  emoji: string;
  label: string; // Hebrew
  color: string; // hex, for tinting
  bg: string; // tailwind-friendly soft background (hex)
};

export const ACTIVITY_TYPES: Record<ActivityType, ActivityMeta> = {
  CHORE: { emoji: "🧹", label: "מטלה", color: "#0ea5e9", bg: "#e0f2fe" },
  CAMP: { emoji: "⛺", label: "קייטנה", color: "#f59e0b", bg: "#fef3c7" },
  SCREEN_TIME: { emoji: "📺", label: "זמן מסך", color: "#a855f7", bg: "#f3e8ff" },
  LEARNING: { emoji: "📚", label: "למידה", color: "#22c55e", bg: "#dcfce7" },
  APPOINTMENT: { emoji: "📅", label: "פגישה", color: "#ef4444", bg: "#fee2e2" },
  FREE_TIME: { emoji: "🎈", label: "זמן חופשי", color: "#ec4899", bg: "#fce7f3" },
  OTHER: { emoji: "✨", label: "אחר", color: "#64748b", bg: "#f1f5f9" },
};

export const ACTIVITY_TYPE_ORDER: ActivityType[] = [
  "CHORE",
  "CAMP",
  "SCREEN_TIME",
  "LEARNING",
  "APPOINTMENT",
  "FREE_TIME",
  "OTHER",
];

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  NONE: "חד פעמי",
  DAILY: "כל יום",
  WEEKDAYS: "ימי חול (א׳–ה׳)",
  WEEKLY: "כל שבוע",
  CUSTOM: "ימים נבחרים",
};

export const ROLE_LABELS: Record<Role, string> = {
  EDITOR: "הורה",
  VIEWER: "ילד/ה",
};

// Hebrew day names, index 0=Sunday .. 6=Saturday
export const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
export const DAY_NAMES_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

// Weekdays in Israel: Sunday–Thursday
export const WEEKDAY_INDICES = [0, 1, 2, 3, 4];

export const MONTH_NAMES = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

// Emoji avatar presets for family members (no file uploads in MVP)
export const AVATAR_PRESETS = [
  "🦊", "🐰", "🐻", "🐼", "🦁", "🐯", "🐨", "🐸",
  "🦄", "🐙", "🦖", "🐶", "🐱", "🦉", "🐳", "🦋",
  "👦", "👧", "👨", "👩", "🧒", "👶",
];

// Color presets for member tinting
export const COLOR_PRESETS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e",
  "#0ea5e9", "#6366f1", "#a855f7", "#ec4899",
];
