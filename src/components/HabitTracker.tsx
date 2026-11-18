"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitForm from "@/components/HabitForm";
import {
  getServerToday,
  getToday,
  parseHabits,
  readHabitsRaw,
  readRaw,
  removeHabit,
  save,
  subscribe,
  subscribeToday,
  upsertHabit,
} from "@/lib/store";
import {
  STORAGE_KEY,
  isDone,
  type Habit,
  type HabitData,
} from "@/lib/habits";

/** "Nov – Dec 2026", or "Nov 2026 – Apr 2027" when the range crosses a year. */
function rangeLabel(v: { y: number; m: number }, count: number) {
  const a = new Date(v.y, v.m, 1);
  const b = new Date(v.y, v.m + count - 1, 1);
  const short = (d: Date) => d.toLocaleDateString(undefined, { month: "short" });
  return a.getFullYear() === b.getFullYear()
    ? `${short(a)} – ${short(b)} ${b.getFullYear()}`
    : `${short(a)} ${a.getFullYear()} – ${short(b)} ${b.getFullYear()}`;
}

function shift(v: { y: number; m: number }, delta: number) {
  const d = new Date(v.y, v.m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

/** Fits as many months as the card can hold; a phone keeps 2, a wide desktop shows more. */
function monthsThatFit(width: number) {
  if (!width) return 2;
  const cell = 24;
  const monthWidth = 6 * (cell + 3) - 3; // widest month spans 6 week-columns
  const gap = 12;
  const inner = width - 44; /* weekday labels */
  return Math.min(12, Math.max(2, Math.floor((inner + gap) / (monthWidth + gap))));
}

/** Tracks the width of the page content so the heatmaps can adapt to any device. */
export default function HabitTracker() {
  const ref = useRef<HTMLDivElement>(null);
  const subscribeWidth = useCallback((cb: () => void) => {
    const el = ref.current;
    if (!el) return () => {};
    const ro = new ResizeObserver(cb);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const width = useSyncExternalStore(subscribeWidth, () => ref.current?.clientWidth ?? 0, () => 0);
  return (
    <div ref={ref} className="mx-auto w-full max-w-[1600px]">
      <TrackerBody width={width} />
    </div>
  );
}

function TrackerBody({ width }: { width: number }) {
  // null on the server, so the first client render matches the server HTML.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const habitsRaw = useSyncExternalStore(subscribe, readHabitsRaw, () => "");
  const habits = useMemo(() => parseHabits(habitsRaw), [habitsRaw]);
  const [editing, setEditing] = useState<Habit | "new" | null>(null);
  const today = useSyncExternalStore(subscribeToday, getToday, getServerToday);
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
    upsertHabit(h);
    setEditing(null);
  };

  const deleteHabit = (id: string) => {
    removeHabit(id);
    setEditing(null);
  };

  if (raw === null || !today) return <div className="h-96" />;

  const months = monthsThatFit(width);
  const monthsAhead = (view.y - Number(today.slice(0, 4))) * 12 + view.m - (Number(today.slice(5, 7)) - 1);

  const weekday = new Date(today + "T00:00").getDay();
  const todays = habits.filter((h) => h.days.includes(weekday));
  const doneToday = todays.filter((h) => isDone(h, data[h.id]?.[today])).length;

  return (
    <div className="w-full space-y-6">
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
              onClick={() => setPicked(shift(view, -Math.max(1, months - 1)))}
              disabled={monthsAhead <= -24}
              aria-label="Previous month"
              className="grid size-10 place-items-center rounded-md text-lg text-zinc-700 active:bg-surface disabled:opacity-30"
            >
              ‹
            </button>
            <span className="min-w-32 text-center text-sm font-medium text-zinc-900">
              {rangeLabel(view, months)}
            </span>
            <button
              onClick={() => setPicked(shift(view, Math.max(1, months - 1)))}
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
              monthCount={months}
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
