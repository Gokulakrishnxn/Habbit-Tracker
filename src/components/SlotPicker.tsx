"use client";

import { useEffect } from "react";
import HabitIcon from "@/components/HabitIcon";
import { SLOTS, SLOT_IDS, dateKey, type Habit, type SlotId } from "@/lib/habits";

const SLOT_PATHS: Record<SlotId, string> = {
  morning: "M17 18a5 5 0 00-10 0M12 2v6M4.2 10.2l1.4 1.4M18.4 11.6l1.4-1.4M1 18h2M21 18h2M2 22h20M8 5l4-3 4 3", // sunrise
  afternoon: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4", // sun
  evening: "M17 18a5 5 0 00-10 0M12 9V3M4.2 10.2l1.4 1.4M18.4 11.6l1.4-1.4M1 18h2M21 18h2M2 22h20M16 6l-4 3-4-3", // sunset
  night: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z", // moon
};

function SlotIcon({ id }: { id: SlotId }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={SLOT_PATHS[id]} />
    </svg>
  );
}

/** Bottom sheet to tick off the times of day (morning / evening / night …) for one date. Works for any past day too. */
export default function SlotPicker({
  habit,
  date,
  raw,
  onChange,
  onClose,
}: {
  habit: Habit;
  /** YYYY-MM-DD */
  date: string;
  /** Stored bitmask for that date */
  raw: number;
  onChange: (raw: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const slots = SLOT_IDS.filter((s) => habit.slots?.includes(s));
  const isPast = date < dateKey(new Date());
  const done = slots.filter((s) => raw & SLOTS[s].bit).length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={(e) => {
        e.stopPropagation(); // don't also close a calendar sheet underneath
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${habit.name} times of day`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg text-white" style={{ backgroundColor: habit.color }}>
            <HabitIcon name={habit.icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-zinc-900">{habit.name}</h2>
            <p className="text-xs text-zinc-500">
              {new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              {isPast ? " · filling in a past day" : ""}
            </p>
          </div>
          <span className="text-sm font-semibold text-zinc-900">
            {done}/{slots.length}
          </span>
        </div>

        <ul className="space-y-2">
          {slots.map((s) => {
            const on = (raw & SLOTS[s].bit) !== 0;
            return (
              <li key={s}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(raw ^ SLOTS[s].bit)}
                  className="flex min-h-14 w-full touch-manipulation items-center gap-3 rounded-xl border px-3 text-left transition-colors [-webkit-tap-highlight-color:transparent] active:scale-[0.99]"
                  style={
                    on
                      ? { borderColor: habit.color, backgroundColor: `color-mix(in srgb, ${habit.color} 14%, transparent)` }
                      : { borderColor: "var(--line)" }
                  }
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg"
                    style={on ? { backgroundColor: habit.color, color: "#fff" } : { backgroundColor: "var(--chip)", color: habit.color }}
                  >
                    <SlotIcon id={s} />
                  </span>
                  <span className="flex-1 font-medium text-zinc-900">{SLOTS[s].label}</span>
                  <span
                    className="grid size-6 place-items-center rounded-full border text-xs font-bold"
                    style={on ? { backgroundColor: habit.color, borderColor: habit.color, color: "#fff" } : { borderColor: "var(--line)", color: "transparent" }}
                    aria-hidden
                  >
                    ✓
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 h-12 w-full touch-manipulation rounded-xl text-base font-semibold text-white"
          style={{ backgroundColor: habit.color }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
