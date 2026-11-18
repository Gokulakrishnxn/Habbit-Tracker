import { ALL_DAYS, HABITS, HABITS_KEY, STORAGE_KEY, type Habit } from "@/lib/habits";

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
