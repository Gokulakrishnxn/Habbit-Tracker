import {
  ALL_DAYS,
  HABITS,
  HABITS_KEY,
  SLOTS,
  STORAGE_KEY,
  dateKey,
  goalOf,
  isDone,
  progress,
  type Habit,
  type HabitData,
} from "@/lib/habits";

/** Tiny localStorage store shared by the tracker and the sidebar (use with useSyncExternalStore). */
export const CHANGE_EVENT = "habits:change";

export function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}
export const noopSubscribe = () => () => {};

/**
 * "Today" as YYYY-MM-DD that keeps up with the clock: re-checked every 30s and when the tab
 * regains focus or visibility, so a page left open past midnight rolls over to the new day.
 */
export function subscribeToday(cb: () => void) {
  const id = setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  window.addEventListener("focus", cb);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
    window.removeEventListener("focus", cb);
  };
}
export const getToday = () => dateKey(new Date());
export const getServerToday = () => "";

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
export const readRaw = () => read(STORAGE_KEY);
export const readHabitsRaw = () => read(HABITS_KEY);

export function parseHabits(raw: string): Habit[] {
  try {
    const list = raw ? JSON.parse(raw) : null;
    if (Array.isArray(list)) return list.map((h) => ({ ...h, days: Array.isArray(h.days) ? h.days : ALL_DAYS }));
  } catch {}
  return HABITS;
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Add a new habit or update an existing one (matched by id). */
export function upsertHabit(h: Habit) {
  const list = parseHabits(readHabitsRaw());
  const old = list.find((x) => x.id === h.id);
  save(HABITS_KEY, old ? list.map((x) => (x.id === h.id ? h : x)) : [...list, h]);
  if (old && trackingMode(old) !== trackingMode(h)) convertHistory(old, h);
}

const trackingMode = (h: Habit) => (h.slots?.length ? "slots" : h.goal > 1 ? "count" : "simple");

/** Switching between done / count / times of day keeps the same share of each day done. */
function convertHistory(old: Habit, next: Habit) {
  let all: HabitData;
  try {
    all = JSON.parse(readRaw() || "{}");
  } catch {
    return;
  }
  const days = all[old.id];
  if (!days) return;
  const target = goalOf(next);
  const converted: Record<string, number> = {};
  for (const [key, raw] of Object.entries(days)) {
    const done = progress(old, raw);
    const np = isDone(old, raw) ? target : Math.floor((done / goalOf(old)) * target);
    if (np <= 0) continue;
    // times of day store a bitmask (first N of the habit's slots); everything else stores the count
    converted[key] = next.slots?.length ? next.slots.slice(0, np).reduce((m, s) => m | SLOTS[s].bit, 0) : np;
  }
  save(STORAGE_KEY, { ...all, [old.id]: converted });
}

/** Delete a habit together with everything logged for it. */
export function removeHabit(id: string) {
  save(HABITS_KEY, parseHabits(readHabitsRaw()).filter((x) => x.id !== id));
  try {
    const latest: HabitData = JSON.parse(readRaw() || "{}");
    delete latest[id];
    save(STORAGE_KEY, latest);
  } catch {}
}
