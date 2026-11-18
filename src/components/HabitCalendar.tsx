"use client";

import { useEffect, useMemo, useState } from "react";
import HabitIcon from "@/components/HabitIcon";
import SlotPicker from "@/components/SlotPicker";
import { SLOTS, dateKey, goalOf, isDone, levelOf, nextCount, progress, type Habit } from "@/lib/habits";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitCalendar({
  habit,
  days,
  onChange,
  onEdit,
  onClose,
}: {
  habit: Habit;
  days: Record<string, number> | undefined;
  onChange: (key: string, count: number) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayKey = dateKey(now);
  const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();

  const cells: (number | null)[] = [
    ...Array<null>(first.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Tracking starts at the earliest of the habit's creation date and its first logged day.
  const startKey = useMemo(() => {
    const logged = Object.keys(days ?? {}).filter((k) => (days?.[k] ?? 0) > 0);
    const all = [...logged, ...(habit.createdAt ? [habit.createdAt] : [])].sort();
    return all[0] ?? null;
  }, [days, habit.createdAt]);

  // Completed = goal met. Missed = a scheduled, already-finished day (before today, since the start) with the goal not met.
  const completed: number[] = [];
  const missed: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(view.y, view.m, d);
    const key = dateKey(date);
    if (isDone(habit, days?.[key])) completed.push(d);
    else if (startKey && key >= startKey && key < todayKey && habit.days.includes(date.getDay())) missed.push(d);
  }
  const missedSet = new Set(missed);
  const [tab, setTab] = useState<"completed" | "missed">("completed");
  const [pickerKey, setPickerKey] = useState<string | null>(null); // date whose times of day are being edited
  const slotted = !!habit.slots?.length;
  const goal = goalOf(habit);
  const listed = tab === "completed" ? completed : missed;

  const go = (delta: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${habit.name} calendar`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg text-white" style={{ backgroundColor: habit.color }}>
            <HabitIcon name={habit.icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-zinc-900">{habit.name}</h2>
            <p className="text-xs text-zinc-500">
              {completed.length} completed · {missed.length} missed
            </p>
          </div>
          <button onClick={onEdit} className="h-11 rounded-lg px-3 text-sm font-medium text-zinc-600 active:bg-zinc-100">
            Edit
          </button>
          <button onClick={onClose} aria-label="Close calendar" className="grid size-11 place-items-center rounded-lg text-xl text-zinc-500 active:bg-zinc-100">
            ✕
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => go(-1)} aria-label="Previous month" className="grid size-11 place-items-center rounded-lg text-lg active:bg-zinc-100">
            ‹
          </button>
          <p className="font-medium text-zinc-900">
            {first.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <button
            onClick={() => go(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="grid size-11 place-items-center rounded-lg text-lg active:bg-zinc-100 disabled:opacity-30"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="pb-1 text-xs font-medium text-zinc-400">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const date = new Date(view.y, view.m, day);
            const key = dateKey(date);
            const future = key > todayKey;
            const raw = days?.[key] ?? 0;
            const p = progress(habit, raw);
            const level = levelOf(p, goal);
            const mix = ["0", "30", "55", "80", "100"][level];
            return (
              <button
                key={i}
                disabled={future}
                onClick={() => (slotted ? setPickerKey(key) : onChange(key, nextCount(raw, goal)))}
                aria-label={`${date.toDateString()}: ${goal > 1 ? `${p}/${goal}` : p ? "done" : "not done"}`}
                style={{
                  backgroundColor: level === 0 ? "var(--chip)" : `color-mix(in srgb, ${habit.color} ${mix}%, var(--chip))`,
                  color: level <= 1 ? "var(--color-zinc-900)" : "#fff",
                }}
                className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl text-sm font-medium disabled:opacity-30 ${
                  key === todayKey ? "outline-2 outline-offset-1 outline-zinc-900" : ""
                }`}
              >
                <span className={level > 0 ? "text-[11px] leading-none opacity-80" : ""}>{day}</span>
                {level === 0 && missedSet.has(day) && <span className="absolute bottom-1.5 size-1 rounded-full bg-red-500" aria-hidden />}
                {level > 0 && !slotted && <HabitIcon name={habit.icon} className="mt-0.5 size-3" />}
                {slotted && (
                  <span className="mt-1 flex gap-[2px]" aria-hidden>
                    {habit.slots!.map((s) => (
                      <span key={s} className="size-[4px] rounded-full bg-current" style={{ opacity: raw & SLOTS[s].bit ? 1 : 0.28 }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Completed / missed summary with the dates */}
        <div className="mt-4 rounded-xl border border-zinc-200 p-3">
          <div className="grid grid-cols-2 gap-2" role="tablist">
            {(
              [
                { id: "completed", label: "Completed", n: completed.length, color: habit.color },
                { id: "missed", label: "Missed", n: missed.length, color: "#ef4444" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="flex min-h-14 flex-col items-start justify-center rounded-lg border px-3 text-left"
                style={
                  tab === t.id
                    ? { borderColor: t.color, backgroundColor: `color-mix(in srgb, ${t.color} 12%, transparent)` }
                    : { borderColor: "var(--line)" }
                }
              >
                <span className="text-xl font-semibold leading-none text-zinc-900">{t.n}</span>
                <span className="mt-1 text-xs text-zinc-500">{t.label} {t.n === 1 ? "day" : "days"}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {listed.length === 0 && (
              <p className="text-xs text-zinc-500">{tab === "completed" ? "No completed days yet this month." : "No missed days this month."}</p>
            )}
            {listed.map((d) => (
              <span
                key={d}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-zinc-700"
                style={{ backgroundColor: "var(--chip)" }}
              >
                {new Date(view.y, view.m, d).toLocaleDateString(undefined, { weekday: "short" })} {d}
              </span>
            ))}
          </div>
        </div>

        {slotted && <p className="mt-3 text-center text-xs text-zinc-500">Tap a day to tick off its times of day. Forgot to log? Fill in any past day.</p>}
        {!slotted && goal > 1 && <p className="mt-3 text-center text-xs text-zinc-500">Tap a day to add one {habit.unit?.replace(/s$/, "")}; goal is {habit.goal}.</p>}
      </div>
      {pickerKey && (
        <SlotPicker
          habit={habit}
          date={pickerKey}
          raw={days?.[pickerKey] ?? 0}
          onChange={(v) => onChange(pickerKey, v)}
          onClose={() => setPickerKey(null)}
        />
      )}
    </div>
  );
}
