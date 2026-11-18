"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import HabitCalendar from "@/components/HabitCalendar";
import HabitIcon from "@/components/HabitIcon";
import SlotPicker from "@/components/SlotPicker";
import { SLOTS, currentStreak, dateKey, goalOf, isDone, levelOf, nextCount, progress, slotsDone, type Habit } from "@/lib/habits";

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

/** Width of an element, kept current as the window or layout changes. */
function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const el = ref.current;
      if (!el) return () => {};
      const ro = new ResizeObserver(cb);
      ro.observe(el);
      return () => ro.disconnect();
    },
    [ref],
  );
  return useSyncExternalStore(subscribe, () => ref.current?.clientWidth ?? 0, () => 0);
}

export default function HabitHeatmap({
  habit,
  days,
  year,
  month,
  monthCount,
  onChange,
  onEdit,
}: {
  habit: Habit;
  days: Record<string, number> | undefined;
  year: number;
  month: number;
  /** How many consecutive months to show, starting at `month`. */
  monthCount: number;
  onChange: (key: string, count: number) => void;
  onEdit: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickerKey, setPickerKey] = useState<string | null>(null); // date whose times of day are being edited
  const slotted = !!habit.slots?.length;
  const goal = goalOf(habit);
  const scroller = useRef<HTMLDivElement>(null);
  const width = useElementWidth(scroller);

  // Pop animation: only on the square the user just filled in (not every square on load).
  const [popKey, setPopKey] = useState<string | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(popTimer.current), []);
  const pop = (key: string) => {
    setPopKey(key);
    clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => setPopKey(null), 600);
  };

  // As many consecutive months as fit, side by side, starting at the chosen month.
  const groups = useMemo(
    () =>
      Array.from({ length: monthCount }, (_, i) => {
        const d = new Date(year, month + i, 1);
        return { y: d.getFullYear(), m: d.getMonth(), weeks: buildWeeks(d.getFullYear(), d.getMonth()) };
      }),
    [year, month, monthCount],
  );

  // Squares grow or shrink so the months always fill the card, on any screen width.
  const cols = groups.reduce((n, g) => n + g.weeks.length, 0);
  const cell = width ? Math.max(18, Math.min(44, Math.floor((width - 34 - (groups.length - 1) * 12 + 3) / cols) - 3)) : 24;

  const todayKey = dateKey(new Date());
  const doneToday = isDone(habit, days?.[todayKey]);
  const restDay = !habit.days.includes(new Date().getDay());
  const streak = currentStreak(habit, days);
  const selectedRaw = selected ? (days?.[selected] ?? 0) : 0;

  const label = (key: string, raw: number) => {
    const p = progress(habit, raw);
    const what = slotted
      ? slotsDone(habit, raw).map((s) => SLOTS[s].label.toLowerCase()).join(", ") || "nothing yet"
      : goal > 1
        ? `${p}/${goal} ${habit.unit ?? ""}`.trim()
        : p
          ? "done"
          : "not done";
    return `${habit.name}: ${what} · ${new Date(key + "T00:00").toDateString()}`;
  };

  return (
    <section id={`habit-${habit.id}`} className="w-full scroll-mt-20 py-1">
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
            {doneToday ? "Done today" : restDay ? "Rest day today" : "Not done today"} · {streak} day streak
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-400">Calendar ›</span>
      </button>

      <div ref={scroller} className="scroll-smooth overflow-x-auto overscroll-x-contain pb-1">
        <div className="flex w-fit gap-2 text-[10px] text-zinc-500" style={{ "--cell": `${cell}px` } as React.CSSProperties}>
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
                      const raw = days?.[key] ?? 0;
                      const p = progress(habit, raw);
                      const level = levelOf(p, goal);
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
                            if (slotted) setPickerKey(key);
                            else {
                              const next = nextCount(raw, goal);
                              onChange(key, next);
                              if (progress(habit, next) > p) pop(key);
                            }
                          }}
                          aria-label={label(key, raw)}
                          title={label(key, raw)}
                          style={{
                            gridRowStart: date.getDay() + 2,
                            backgroundColor:
                              level === 0 ? "var(--empty)" : `color-mix(in srgb, ${habit.color} ${MIX[level]}%, var(--empty))`,
                            color: level <= 1 ? habit.color : "#fff",
                            // Border highlighter on today's square (a selected square keeps its dark outline)
                            ...(isToday && selected !== key ? { outline: `2px solid ${habit.color}`, outlineOffset: 0 } : {}),
                          }}
                          className={`relative grid size-[var(--cell)] touch-manipulation select-none place-items-center rounded-[4px] transition-[transform,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] after:absolute after:-inset-[1.5px] after:content-[''] active:scale-90 ${
                            future ? "cursor-default" : ""} ${offDay ? "opacity-50" : ""} ${
                            selected === key ? "outline-2 outline-zinc-900" : ""
                          }`}
                        >
                          {level > 0 ? (
                            <>
                              <span className="absolute left-[3px] top-[2px] text-[8px] font-medium leading-none opacity-70">
                                {date.getDate()}
                              </span>
                              <HabitIcon name={habit.icon} className={`mt-1 ${cell >= 32 ? "size-4" : "size-3"} ${popKey === key ? "animate-icon-pop" : ""}`} />
                            </>
                          ) : (
                            <span className={`text-[10px] leading-none ${isToday ? "font-bold text-zinc-900" : "text-zinc-400"}`}>{date.getDate()}</span>
                          )}
                          {slotted && (
                            <span className="absolute inset-x-0 bottom-[2px] flex justify-center gap-[2px]" aria-hidden>
                              {habit.slots!.map((s) => (
                                <span key={s} className="size-[3px] rounded-full bg-current" style={{ opacity: raw & SLOTS[s].bit ? 1 : 0.28 }} />
                              ))}
                            </span>
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

      {selected && <p className="mt-2 text-xs text-zinc-600">{label(selected, selectedRaw)}</p>}
      {pickerKey && (
        <SlotPicker
          habit={habit}
          date={pickerKey}
          raw={days?.[pickerKey] ?? 0}
          onChange={(v) => {
            if (progress(habit, v) > progress(habit, days?.[pickerKey] ?? 0)) pop(pickerKey);
            onChange(pickerKey, v);
          }}
          onClose={() => setPickerKey(null)}
        />
      )}
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
