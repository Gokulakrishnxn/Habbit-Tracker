"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import HabitIcon from "@/components/HabitIcon";
import ThemeToggle from "@/components/ThemeToggle";
import { dateKey, routineLabel, type HabitData } from "@/lib/habits";
import { noopSubscribe, parseHabits, readHabitsRaw, readRaw, subscribe } from "@/lib/store";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  // Server snapshot is empty, so the first client render matches the server HTML.
  const habitsRaw = useSyncExternalStore(subscribe, readHabitsRaw, () => null);
  const dataRaw = useSyncExternalStore(subscribe, readRaw, () => "");
  const today = useSyncExternalStore(noopSubscribe, () => dateKey(new Date()), () => "");

  const habits = useMemo(() => (habitsRaw === null ? [] : parseHabits(habitsRaw)), [habitsRaw]);
  const data = useMemo<HabitData>(() => {
    try {
      return dataRaw ? JSON.parse(dataRaw) : {};
    } catch {
      return {};
    }
  }, [dataRaw]);

  const weekday = today ? new Date(today + "T00:00").getDay() : -1;

  return (
    <>
      {/* Top nav bar: menu button (phones) + theme toggle */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b border-zinc-200 bg-surface px-[max(1rem,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] md:left-64 md:px-6">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-lg active:bg-zinc-100 md:hidden">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="hidden md:block" />
        <ThemeToggle />
      </header>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/30 md:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[80vw] flex-col border-r border-zinc-200 bg-surface pt-[env(safe-area-inset-top)] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="px-5 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Habits</p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {habits.map((h) => {
            const count = data[h.id]?.[today] ?? 0;
            const done = count >= h.goal;
            const scheduled = h.days.includes(weekday);
            return (
              <a
                key={h.id}
                href={`#habit-${h.id}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 active:bg-zinc-100 md:hover:bg-zinc-50"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-md"
                  style={{ backgroundColor: done ? h.color : "var(--chip)", color: done ? "#fff" : h.color }}
                >
                  <HabitIcon name={h.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900">{h.name}</span>
                  <span className="block truncate text-xs text-zinc-500">
                    {!scheduled ? "Off today" : h.goal > 1 ? `${count}/${h.goal} ${h.unit}` : done ? "Done" : routineLabel(h.days)}
                  </span>
                </span>
              </a>
            );
          })}
          {today && habits.length === 0 && <p className="px-2 text-sm text-zinc-500">No habits yet.</p>}
        </nav>
      </aside>
    </>
  );
}
