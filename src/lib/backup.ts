import {
  ALL_DAYS,
  HABITS_KEY,
  ICON_NAMES,
  PALETTE,
  STORAGE_KEY,
  dateKey,
  type Habit,
  type HabitData,
  type IconName,
} from "@/lib/habits";
import { parseHabits, readHabitsRaw, readRaw, save } from "@/lib/store";

/** The backup file: plain JSON you can keep, move to another device, or send to someone. */
export type Backup = {
  app: "habit-tracker";
  version: 1;
  exportedAt: string;
  habits: Habit[];
  data: HabitData;
};

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

function currentData(): HabitData {
  try {
    return JSON.parse(readRaw() || "{}");
  } catch {
    return {};
  }
}

export function buildBackup(): Backup {
  return {
    app: "habit-tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    habits: parseHabits(readHabitsRaw()),
    data: currentData(),
  };
}

export function backupFileName() {
  return `habit-tracker-${dateKey(new Date())}.json`;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function cleanHabit(raw: unknown): Habit | null {
  if (!isObject(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id.trim().slice(0, 64) : "";
  const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 40) : "";
  if (!id || !name) return null;
  const goal = Number.isInteger(raw.goal) && (raw.goal as number) >= 1 ? Math.min(99, raw.goal as number) : 1;
  const days = Array.isArray(raw.days)
    ? [...new Set(raw.days.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))].sort()
    : ALL_DAYS;
  const created = typeof raw.createdAt === "string" && DATE_RE.test(raw.createdAt) ? raw.createdAt : undefined;
  return {
    id,
    name,
    icon: (ICON_NAMES as readonly string[]).includes(raw.icon as string) ? (raw.icon as IconName) : "check",
    color: typeof raw.color === "string" && COLOR_RE.test(raw.color) ? raw.color : PALETTE[0],
    goal,
    unit: goal > 1 ? (typeof raw.unit === "string" && raw.unit.trim() ? raw.unit.trim().slice(0, 16) : "times") : undefined,
    days: days.length ? days : ALL_DAYS,
    createdAt: created,
  };
}

function cleanData(raw: unknown): HabitData {
  const out: HabitData = {};
  if (!isObject(raw)) return out;
  for (const [id, days] of Object.entries(raw)) {
    if (!isObject(days)) continue;
    const clean: Record<string, number> = {};
    for (const [key, n] of Object.entries(days)) {
      if (DATE_RE.test(key) && Number.isInteger(n) && (n as number) > 0) clean[key] = Math.min(999, n as number);
    }
    out[id] = clean;
  }
  return out;
}

export type ParsedBackup = { habits: Habit[]; data: HabitData; loggedDays: number };

/** Reads a backup file's text. Returns a friendly error instead of throwing. */
export function parseBackup(text: string): { ok: true; backup: ParsedBackup } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (!isObject(json) || json.app !== "habit-tracker" || !Array.isArray(json.habits)) {
    return { ok: false, error: "That doesn't look like a Habit Tracker backup." };
  }
  const habits = json.habits.map(cleanHabit).filter((h): h is Habit => h !== null);
  const seen = new Set<string>();
  const unique = habits.filter((h) => (seen.has(h.id) ? false : (seen.add(h.id), true)));
  const data = cleanData(json.data);
  const loggedDays = Object.values(data).reduce((sum, d) => sum + Object.keys(d).length, 0);
  return { ok: true, backup: { habits: unique, data, loggedDays } };
}

/** merge: keep everything you have and add what's new (the higher count wins on a clash). replace: swap it all. */
export function applyBackup(b: ParsedBackup, mode: "merge" | "replace") {
  if (mode === "replace") {
    save(HABITS_KEY, b.habits);
    save(STORAGE_KEY, b.data);
    return;
  }
  const current = parseHabits(readHabitsRaw());
  const have = new Set(current.map((h) => h.id));
  save(HABITS_KEY, [...current, ...b.habits.filter((h) => !have.has(h.id))]);

  const merged = currentData();
  for (const [id, days] of Object.entries(b.data)) {
    const into = { ...(merged[id] ?? {}) };
    for (const [key, n] of Object.entries(days)) into[key] = Math.max(into[key] ?? 0, n);
    merged[id] = into;
  }
  save(STORAGE_KEY, merged);
}
