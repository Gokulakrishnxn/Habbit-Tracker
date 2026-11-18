"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitForm from "@/components/HabitForm";
import { noopSubscribe, parseHabits, readHabitsRaw, readRaw, save, subscribe } from "@/lib/store";
import {
  HABITS_KEY,
  STORAGE_KEY,
  dateKey,
  type Habit,
  type HabitData,
} from "@/lib/habits";

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

  const monthsAhead = (view.y - Number(today.slice(0, 4))) * 12 + view.m - (Number(today.slice(5, 7)) - 1);
  const isCurrentMonth = monthsAhead <= 0;

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
            className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-lg leading-none text-white dark:text-black shadow-sm active:scale-95"
          >
            +
          </button>
        </div>

        {habits.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            No habits yet. Tap + to add your first one.
          </p>
        )}
      </section>

      {/* Heatmaps */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">Activity</h2>
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            <button
              onClick={() => setPicked(shift(view, -1))}
              disabled={isCurrentMonth}
              aria-label="Previous month"
              className="grid size-10 place-items-center rounded-md text-lg text-zinc-700 active:bg-surface disabled:opacity-30"
            >
              ‹
            </button>
            <span className="min-w-32 text-center text-sm font-medium text-zinc-900">
              {new Date(view.y, view.m, 1).toLocaleDateString(undefined, { month: "short" })} –{" "}
              {new Date(view.y, view.m + 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() => setPicked(shift(view, 1))}
              disabled={monthsAhead >= 12}
              aria-label="Next month"
              className="grid size-10 place-items-center rounded-md text-lg text-zinc-700 active:bg-surface disabled:opacity-30"
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
