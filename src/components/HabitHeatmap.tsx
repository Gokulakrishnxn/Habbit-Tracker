"use client";

import { useMemo, useState } from "react";
import HabitCalendar from "@/components/HabitCalendar";
import HabitIcon from "@/components/HabitIcon";
import { currentStreak, dateKey, levelOf, nextCount, type Habit } from "@/lib/habits";

const MIX = ["0", "30", "55", "80", "100"]; // % of the habit colour per level
const CELL = 24;

type Cell = { date: Date; key: string };

/** Columns are weeks (Sun–Sat); only days inside the chosen month (and not in the future) get a square. */
function buildWeeks(year: number, month: number): Cell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - first.getDay());

  const weeks: Cell[][] = [];
  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      if (date.getMonth() !== month || date > today) continue;
      week.push({ date, key: dateKey(date) });
    }
    weeks.push(week);
  }
  return weeks;
}

export default function HabitHeatmap({
  habit,
  days,
  year,
  month,
  onChange,
  onEdit,
}: {
  habit: Habit;
  days: Record<string, number> | undefined;
  year: number;
  month: number;
  onChange: (key: string, count: number) => void;
  onEdit: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Two months side by side: the one before the chosen month, then the chosen month.
  const groups = useMemo(() => {
    const prev = new Date(year, month - 1, 1);
    return [
      { y: prev.getFullYear(), m: prev.getMonth() },
      { y: year, m: month },
    ].map(({ y, m }) => ({ y, m, weeks: buildWeeks(y, m) }));
  }, [year, month]);

  const monthDone = groups.flatMap((g) => g.weeks.flat()).filter(({ key }) => (days?.[key] ?? 0) >= habit.goal).length;
  const streak = currentStreak(days, habit.goal, habit.days);
  const selectedCount = selected ? (days?.[selected] ?? 0) : 0;

  const label = (key: string, count: number) =>
    `${habit.name}: ${habit.goal > 1 ? `${count}/${habit.goal} ${habit.unit ?? ""}`.trim() : count ? "done" : "not done"} · ${new Date(key + "T00:00").toDateString()}`;

  return (
    <section className="w-full rounded-xl border border-zinc-200 p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setCalendarOpen(true)}
        aria-label={`Open ${habit.name} calendar`}
        className="mb-3 flex w-full items-center gap-3 rounded-lg text-left active:opacity-70"
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-md text-white"
          style={{ backgroundColor: habit.color }}
        >
          <HabitIcon name={habit.icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-zinc-900 sm:text-base">{habit.name}</h2>
          <p className="text-xs text-zinc-500">
            {monthDone} {monthDone === 1 ? "day" : "days"} in 2 months · {streak} day streak
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-400">Calendar ›</span>
      </button>

      <div className="overflow-x-auto overscroll-x-contain pb-1">
        <div className="flex w-fit gap-2 text-[10px] text-zinc-500" style={{ "--cell": `${CELL}px` } as React.CSSProperties}>
          {/* weekday labels, aligned to rows like GitHub (Mon / Wed / Fri) */}
          <div className="grid grid-rows-[14px_repeat(7,var(--cell))] gap-[3px] leading-[var(--cell)]">
            <span />
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>

          <div className="flex gap-3">
            {groups.map((g) => (
              <div key={`${g.y}-${g.m}`} className="flex gap-[3px]">
                {g.weeks.map((week, i) => (
                  <div key={i} className="grid grid-rows-[14px_repeat(7,var(--cell))] gap-[3px]">
                    <span className="h-[14px] w-[var(--cell)] overflow-visible whitespace-nowrap leading-[14px]">
                      {i === 0 ? new Date(g.y, g.m, 1).toLocaleDateString(undefined, { month: "short" }) : ""}
                    </span>
                    {week.map(({ date, key }) => {
                      const count = days?.[key] ?? 0;
                      const level = levelOf(count, habit.goal);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelected(key);
                            onChange(key, nextCount(count, habit.goal));
                          }}
                          aria-label={label(key, count)}
                          title={label(key, count)}
                          style={{
                            gridRowStart: date.getDay() + 2,
                            backgroundColor:
                              level === 0 ? "#ebedf0" : `color-mix(in srgb, ${habit.color} ${MIX[level]}%, #ebedf0)`,
                            color: level <= 1 ? habit.color : "#fff",
                          }}
                          className={`grid size-[var(--cell)] place-items-center rounded-[4px] outline-1 -outline-offset-1 outline-black/5 ${
                            selected === key ? "outline-2 outline-zinc-900" : ""
                          }`}
                        >
                          {level > 0 && <HabitIcon name={habit.icon} className="size-3" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-zinc-600">
          {selected ? label(selected, selectedCount) : "Tap a square to log that day"}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          Less
          {MIX.map((m, i) => (
            <span
              key={m}
              className="size-[11px] rounded-[2px] outline-1 -outline-offset-1 outline-black/5"
              style={{ backgroundColor: i === 0 ? "#ebedf0" : `color-mix(in srgb, ${habit.color} ${m}%, #ebedf0)` }}
            />
          ))}
          More
        </div>
      </div>
      {calendarOpen && (
        <HabitCalendar
          habit={habit}
          days={days}
          onChange={onChange}
          onEdit={() => {
            setCalendarOpen(false);
            onEdit();
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </section>
  );
}
