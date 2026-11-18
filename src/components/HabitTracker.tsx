"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitIcon from "@/components/HabitIcon";
import HabitForm from "@/components/HabitForm";
import {
  ALL_DAYS,
  HABITS,
  HABITS_KEY,
  STORAGE_KEY,
  dateKey,
  nextCount,
  type Habit,
  type HabitData,
} from "@/lib/habits";

const CHANGE_EVENT = "habits:change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}
const noopSubscribe = () => () => {};

function read(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
const readRaw = () => read(STORAGE_KEY);
const readHabitsRaw = () => read(HABITS_KEY);

function parseHabits(raw: string): Habit[] {
  try {
    const list = raw ? JSON.parse(raw) : null;
    if (Array.isArray(list)) return list.map((h) => ({ ...h, days: Array.isArray(h.days) ? h.days : ALL_DAYS }));
  } catch {}
  return HABITS;
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function shift(v: { y: number; m: number }, delta: number) {
  const d = new Date(v.y, v.m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

export default function HabitTracker() {
  // null on the server, so the first client render matches the server HTML.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const habitsRaw = useSyncExternalStore(subscribe, readHabitsRaw, () => "");
  const habits = useMemo(() => parseHabits(habitsRaw), [habitsRaw]);
  const [editing, setEditing] = useState<Habit | "new" | null>(null);
  const today = useSyncExternalStore(noopSubscribe, () => dateKey(new Date()), () => "");
  const [picked, setPicked] = useState<{ y: number; m: number } | null>(null);
  // Until the user navigates, show the current month (derived from the client-only `today`).
  const view = picked ?? { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };

  const data = useMemo<HabitData>(() => {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [raw]);

  const set = (habitId: string, key: string, count: number) => {
    // Re-read storage so rapid taps never overwrite each other with stale render data.
    let latest: HabitData = {};
    try {
      latest = JSON.parse(readRaw() || "{}");
    } catch {}
    const days = { ...(latest[habitId] ?? {}) };
    if (count > 0) days[key] = count;
    else delete days[key];
    save(STORAGE_KEY, { ...latest, [habitId]: days });
  };

  const saveHabit = (h: Habit) => {
    const list = parseHabits(readHabitsRaw());
    save(HABITS_KEY, list.some((x) => x.id === h.id) ? list.map((x) => (x.id === h.id ? h : x)) : [...list, h]);
    setEditing(null);
  };

  const deleteHabit = (id: string) => {
    save(HABITS_KEY, parseHabits(readHabitsRaw()).filter((x) => x.id !== id));
    try {
      const latest: HabitData = JSON.parse(readRaw() || "{}");
      delete latest[id];
      save(STORAGE_KEY, latest);
    } catch {}
    setEditing(null);
  };

  if (raw === null || !today) return <div className="h-96" />;

  const isCurrentMonth = view.y === Number(today.slice(0, 4)) && view.m === Number(today.slice(5, 7)) - 1;

  const weekday = new Date(today + "T00:00").getDay();
  const todays = habits.filter((h) => h.days.includes(weekday));
  const doneToday = todays.filter((h) => (data[h.id]?.[today] ?? 0) >= h.goal).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Today */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Today</h1>
            <p className="text-sm text-zinc-500">
              {doneToday} of {todays.length} done ·{" "}
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing("new")}
            aria-label="Add habit"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-lg leading-none text-white shadow-sm active:scale-95"
          >
            +
          </button>
        </div>

        {todays.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            {habits.length === 0 ? "No habits yet. Tap + to add your first one." : "Nothing scheduled today."}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {todays.map((h) => {
            const count = data[h.id]?.[today] ?? 0;
            const done = count >= h.goal;
            return (
              <div
                key={h.id}
                className="flex items-center gap-2 rounded-xl border p-3 transition-colors"
                style={{
                  borderColor: done ? h.color : "#e4e4e7",
                  backgroundColor: done ? `color-mix(in srgb, ${h.color} 10%, white)` : "white",
                }}
              >
                <button
                  type="button"
                  onClick={() => set(h.id, today, nextCount(count, h.goal))}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left active:opacity-70"
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-md"
                    style={{ backgroundColor: done ? h.color : "#f4f4f5", color: done ? "#fff" : h.color }}
                  >
                    <HabitIcon name={h.icon} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-900">{h.name}</span>
                    <span className="block text-xs text-zinc-500">
                      {h.goal > 1 ? `${count}/${h.goal} ${h.unit}` : done ? "Done" : "Tap to log"}
                    </span>
                  </span>
                </button>
                {h.goal > 1 && count > 0 && (
                  <button
                    type="button"
                    aria-label={`Remove one ${h.name}`}
                    onClick={() => set(h.id, today, count - 1)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-lg text-zinc-500 active:bg-zinc-100"
                  >
                    −
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Heatmaps */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">Activity</h2>
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            <button
              onClick={() => setPicked(shift(view, -1))}
              aria-label="Previous month"
              className="grid size-10 place-items-center rounded-md text-lg text-zinc-700 active:bg-white"
            >
              ‹
            </button>
            <span className="min-w-32 text-center text-sm font-medium text-zinc-900">
              {new Date(view.y, view.m - 1, 1).toLocaleDateString(undefined, { month: "short" })} –{" "}
              {new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() => setPicked(shift(view, 1))}
              disabled={isCurrentMonth}
              aria-label="Next month"
              className="grid size-10 place-items-center rounded-md text-lg text-zinc-700 active:bg-white disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {habits.map((h) => (
            <HabitHeatmap
              key={h.id}
              habit={h}
              days={data[h.id]}
              year={view.y}
              month={view.m}
              onChange={(key, count) => set(h.id, key, count)}
              onEdit={() => setEditing(h)}
            />
          ))}
        </div>
      </section>

      {editing && (
        <HabitForm
          initial={editing === "new" ? undefined : editing}
          onSave={saveHabit}
          onDelete={editing === "new" ? undefined : () => deleteHabit(editing.id)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
