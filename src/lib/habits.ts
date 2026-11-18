export const ICON_NAMES = [
  "sparkles",
  "droplet",
  "dumbbell",
  "briefcase",
  "layers",
  "book",
  "heart",
  "sun",
  "moon",
  "coffee",
  "music",
  "code",
  "pencil",
  "flame",
  "leaf",
  "star",
  "pill",
  "check",
  "bike",
  "zap",
  "apple",
  "bed",
  "smile",
  "target",
  "clock",
  "camera",
  "home",
  "dollar",
  "wind",
  "mountain",
  "eye",
  "lightbulb",
  "message",
  "shield",
  "gift",
  "cloud",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** Natural colours to pick from. */
export const PALETTE = [
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#d97706", // amber
  "#65a30d", // lime
  "#16a34a", // green
  "#0d9488", // teal
  "#0ea5e9", // sky
  "#4f46e5", // indigo
  "#8b5cf6", // violet
  "#b45309", // brown
  "#52525b", // graphite
  "#f43f5e", // rose
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#eab308", // yellow
  "#84cc16", // spring green
  "#64748b", // slate
  "#78350f", // coffee
  "#0f766e", // deep teal
  "#be123c", // crimson
];

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Times of day a habit can be split into (for example skin care: morning, evening, night).
 * Each slot owns a fixed bit, so a day's logged value is a bitmask and stays valid if the slots change.
 */
export const SLOT_IDS = ["morning", "afternoon", "evening", "night"] as const;
export type SlotId = (typeof SLOT_IDS)[number];
export const SLOTS: Record<SlotId, { label: string; bit: number }> = {
  morning: { label: "Morning", bit: 1 },
  afternoon: { label: "Afternoon", bit: 2 },
  evening: { label: "Evening", bit: 4 },
  night: { label: "Night", bit: 8 },
};

export type Habit = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  /** Count needed to mark the day as done (1 = simple yes/no habit). */
  goal: number;
  unit?: string;
  /** Routine: weekdays (0 = Sunday) this habit is scheduled on. */
  days: number[];
  /** Optional times of day. When set, each day logs which slots were done and the habit is complete when all are. */
  slots?: SlotId[];
  /** YYYY-MM-DD the habit was created (used so days before it are not counted as missed). */
  createdAt?: string;
};

export const HABITS: Habit[] = [
  { id: "skincare", name: "Skin care", icon: "sparkles", color: "#ec4899", goal: 1, days: ALL_DAYS },
  { id: "water", name: "Water intake", icon: "droplet", color: "#0ea5e9", goal: 8, unit: "glasses", days: ALL_DAYS },
  { id: "gym", name: "Gym", icon: "dumbbell", color: "#f97316", goal: 1, days: ALL_DAYS },
  { id: "work", name: "Work", icon: "briefcase", color: "#16a34a", goal: 1, days: ALL_DAYS },
  { id: "projects", name: "Projects", icon: "layers", color: "#8b5cf6", goal: 1, days: ALL_DAYS },
  { id: "reading", name: "Reading", icon: "book", color: "#b45309", goal: 1, days: ALL_DAYS },
];

/** habitId -> (YYYY-MM-DD -> count) */
export type HabitData = Record<string, Record<string, number>>;

export const STORAGE_KEY = "habits:v1";
export const HABITS_KEY = "habits:list:v1";

export function dateKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Target for a day: one per time-of-day slot, otherwise the habit's goal. */
export const goalOf = (h: Habit) => (h.slots?.length ? h.slots.length : h.goal);

export const slotMask = (h: Habit) => (h.slots ?? []).reduce((mask, s) => mask | SLOTS[s].bit, 0);

const popcount = (n: number) => {
  let c = 0;
  for (; n; n >>= 1) c += n & 1;
  return c;
};

/** How much of the day's goal is done, from the raw stored value. */
export function progress(h: Habit, raw = 0) {
  return h.slots?.length ? popcount(raw & slotMask(h)) : raw;
}

export const isDone = (h: Habit, raw = 0) => progress(h, raw) >= goalOf(h);

/** Which time-of-day slots are done in a raw stored value. */
export const slotsDone = (h: Habit, raw = 0): SlotId[] => (h.slots ?? []).filter((s) => raw & SLOTS[s].bit);

export function levelOf(count: number, goal: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / goal) * 4))) as 1 | 2 | 3 | 4;
}

/** Tapping a day: yes/no habits toggle, counted habits go up by one and wrap to 0 past the goal. */
export function nextCount(count: number, goal: number) {
  if (goal === 1) return count ? 0 : 1;
  return count >= goal ? 0 : count + 1;
}

/** Consecutive scheduled days completed; days outside the routine neither break nor extend a streak. */
export function currentStreak(habit: Habit, days: Record<string, number> = {}) {
  const schedule = habit.days;
  if (schedule.length === 0) return 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const done = () => isDone(habit, days[dateKey(d)] ?? 0);
  // today may still be in progress, so an unfinished today doesn't break the streak
  if (schedule.includes(d.getDay()) && !done()) d.setDate(d.getDate() - 1);
  let streak = 0;
  for (let guard = 0; guard < 4000; guard++) {
    if (schedule.includes(d.getDay())) {
      if (!done()) break;
      streak++;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function routineLabel(days: number[]) {
  const s = [...days].sort().join();
  if (days.length === 7) return "Every day";
  if (s === "1,2,3,4,5") return "Weekdays";
  if (s === "0,6") return "Weekends";
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].filter((_, i) => days.includes(i)).join(", ");
}
