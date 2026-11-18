"use client";

import { useMemo, useState } from "react";
import HabitCalendar from "@/components/HabitCalendar";
import HabitIcon from "@/components/HabitIcon";
import { currentStreak, dateKey, levelOf, nextCount, type Habit } from "@/lib/habits";

const MIX = ["0", "30", "55", "80", "100"]; // % of the habit colour per level

type Cell = { date: Date; key: string };

/** Columns are weeks (Sun–Sat); every day of the chosen month gets a square (future days are shown but disabled). */
function buildWeeks(year: number, month: number): Cell[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - first.getDay());

  const weeks: Cell[][] = [];
  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
    const week: Cell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      if (date.getMonth() !== month) continue;
      week.push({ date, key: dateKey(date) });
    }
    if (week.length) weeks.push(week);
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
  // Two months side by side, looking forward: the chosen month, then the next one.
  const groups = useMemo(() => {
    const next = new Date(year, month + 1, 1);
    return [
      { y: year, m: month },
      { y: next.getFullYear(), m: next.getMonth() },
    ].map(({ y, m }) => ({ y, m, weeks: buildWeeks(y, m) }));
  }, [year, month]);

  const todayKey = dateKey(new Date());
  const doneToday = (days?.[todayKey] ?? 0) >= habit.goal;
  const streak = currentStreak(days, habit.goal, habit.days);
  const selectedCount = selected ? (days?.[selected] ?? 0) : 0;

  const label = (key: string, count: number) =>
    `${habit.name}: ${habit.goal > 1 ? `${count}/${habit.goal} ${habit.unit ?? ""}`.trim() : count ? "done" : "not done"} · ${new Date(key + "T00:00").toDateString()}`;

  return (
    <section id={`habit-${habit.id}`} className="w-full scroll-mt-20 rounded-xl border border-zinc-200 p-3 sm:p-4">
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
            {doneToday ? "Done today" : "Not done today"} · {streak} day streak
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-400">Calendar ›</span>
      </button>

      <div className="overflow-x-auto overscroll-x-contain pb-1">
        <div className="flex w-fit gap-2 text-[10px] text-zinc-500 [--cell:24px] [@media(pointer:coarse)]:[--cell:28px]">
          {/* weekday labels, one per row */}
          <div className="grid grid-rows-[14px_repeat(7,var(--cell))] gap-[3px] leading-[var(--cell)]">
            <span />
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <span key={d} className={i === new Date().getDay() ? "font-semibold text-zinc-900" : ""}>
                {d}
              </span>
            ))}
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
                      const future = key > todayKey;
                      const offDay = !habit.days.includes(date.getDay());
                      const isToday = key === todayKey;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={future}
                          onClick={() => {
                            setSelected(key);
                            onChange(key, nextCount(count, habit.goal));
                          }}
                          aria-label={label(key, count)}
                          title={label(key, count)}
                          style={{
                            gridRowStart: date.getDay() + 2,
                            backgroundColor:
                              level === 0 ? "var(--empty)" : `color-mix(in srgb, ${habit.color} ${MIX[level]}%, var(--empty))`,
                            color: level <= 1 ? habit.color : "#fff",
                            // Border highlighter on today's square (a selected square keeps its dark outline)
                            ...(isToday && selected !== key ? { outline: `2px solid ${habit.color}`, outlineOffset: 0 } : {}),
                          }}
                          className={`relative grid size-[var(--cell)] touch-manipulation select-none place-items-center rounded-[4px] outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10 transition-transform duration-75 [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] after:absolute after:-inset-[1.5px] after:content-[''] active:scale-90 ${
                            future ? "cursor-default" : ""} ${offDay ? "opacity-50" : ""} ${
                            selected === key ? "outline-2 outline-zinc-900" : ""
                          }`}
                        >
                          {level > 0 ? (
                            <>
                              <span className="absolute left-[3px] top-[2px] text-[8px] font-medium leading-none opacity-70">
                                {date.getDate()}
                              </span>
                              <HabitIcon name={habit.icon} className="mt-1 size-3" />
                            </>
                          ) : (
                            <span className={`text-[10px] leading-none ${isToday ? "font-bold text-zinc-900" : "text-zinc-400"}`}>{date.getDate()}</span>
                          )}
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

      {selected && <p className="mt-2 text-xs text-zinc-600">{label(selected, selectedCount)}</p>}
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
