"use client";

import { useEffect, useState } from "react";
import HabitIcon from "@/components/HabitIcon";
import { dateKey, levelOf, nextCount, type Habit } from "@/lib/habits";

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

  let doneDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if ((days?.[dateKey(new Date(view.y, view.m, d))] ?? 0) >= habit.goal) doneDays++;
  }

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
        className="w-full max-w-md rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg text-white" style={{ backgroundColor: habit.color }}>
            <HabitIcon name={habit.icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-zinc-900">{habit.name}</h2>
            <p className="text-xs text-zinc-500">
              {doneDays} of {daysInMonth} days done
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
            const count = days?.[key] ?? 0;
            const level = levelOf(count, habit.goal);
            const mix = ["0", "30", "55", "80", "100"][level];
            return (
              <button
                key={i}
                disabled={future}
                onClick={() => onChange(key, nextCount(count, habit.goal))}
                aria-label={`${date.toDateString()}: ${habit.goal > 1 ? `${count}/${habit.goal}` : count ? "done" : "not done"}`}
                style={{
                  backgroundColor: level === 0 ? "var(--chip)" : `color-mix(in srgb, ${habit.color} ${mix}%, var(--chip))`,
                  color: level <= 1 ? "var(--color-zinc-900)" : "#fff",
                }}
                className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl text-sm font-medium disabled:opacity-30 ${
                  key === todayKey ? "outline-2 outline-offset-1 outline-zinc-900" : ""
                }`}
              >
                <span className={level > 0 ? "text-[11px] leading-none opacity-80" : ""}>{day}</span>
                {level > 0 && <HabitIcon name={habit.icon} className="mt-0.5 size-3" />}
              </button>
            );
          })}
        </div>

        {habit.goal > 1 && <p className="mt-3 text-center text-xs text-zinc-500">Tap a day to add one {habit.unit?.replace(/s$/, "")}; goal is {habit.goal}.</p>}
      </div>
    </div>
  );
}
