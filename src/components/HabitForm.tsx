"use client";

import { useEffect, useState } from "react";
import HabitIcon from "@/components/HabitIcon";
import { ALL_DAYS, ICON_NAMES, PALETTE, dateKey, routineLabel, type Habit } from "@/lib/habits";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PRESETS = [
  { label: "Every day", days: ALL_DAYS },
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Weekends", days: [0, 6] },
];

export default function HabitForm({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: Habit;
  onSave: (habit: Habit) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? ICON_NAMES[0]);
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [counted, setCounted] = useState((initial?.goal ?? 1) > 1);
  const [goal, setGoal] = useState(String(initial && initial.goal > 1 ? initial.goal : 8));
  const [unit, setUnit] = useState(initial?.unit ?? "times");
  const [days, setDays] = useState<number[]>(initial?.days ?? ALL_DAYS);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const goalNum = Math.min(99, Math.max(2, Math.floor(Number(goal)) || 2));
  const valid = name.trim().length > 0 && days.length > 0;

  const toggleDay = (d: number) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      id: initial?.id ?? `h_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      icon,
      color,
      goal: counted ? goalNum : 1,
      unit: counted ? unit.trim() || "times" : undefined,
      days,
      createdAt: initial?.createdAt ?? dateKey(new Date()),
    });
  };

  const label = "mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "Edit habit" : "New habit"}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl text-white" style={{ backgroundColor: color }}>
            <HabitIcon name={icon} className="size-5" />
          </span>
          <h2 className="flex-1 text-lg font-semibold text-zinc-900">{initial ? "Edit habit" : "New habit"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-lg text-xl text-zinc-500 active:bg-zinc-100">
            ✕
          </button>
        </div>

        <label className={label} htmlFor="habit-name">Name</label>
        <input
          id="habit-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="e.g. Meditate"
          className="mb-5 h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-base text-zinc-900 outline-none focus:border-zinc-900"
        />

        <span className={label}>Colour</span>
        <div className="mb-5 flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              aria-pressed={color === c}
              className={`size-9 rounded-full ${color === c ? "outline-2 outline-offset-2 outline-zinc-900" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <span className={label}>Icon</span>
        <div className="mb-5 grid grid-cols-6 gap-2">
          {ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIcon(n)}
              aria-label={`Icon ${n}`}
              aria-pressed={icon === n}
              className="grid size-11 place-items-center rounded-xl border"
              style={
                icon === n
                  ? { backgroundColor: color, borderColor: color, color: "#fff" }
                  : { borderColor: "var(--line)", color: "var(--color-zinc-600)" }
              }
            >
              <HabitIcon name={n} className="size-5" />
            </button>
          ))}
        </div>

        <span className={label}>Track as</span>
        <div className="mb-3 flex rounded-lg bg-zinc-100 p-1">
          {[
            { v: false, t: "Done / not done" },
            { v: true, t: "Count" },
          ].map((o) => (
            <button
              key={o.t}
              type="button"
              onClick={() => setCounted(o.v)}
              className={`min-h-10 flex-1 rounded-md text-sm font-medium ${counted === o.v ? "bg-surface text-zinc-900 shadow-sm" : "text-zinc-500"}`}
            >
              {o.t}
            </button>
          ))}
        </div>
        {counted && (
          <div className="mb-5 flex gap-3">
            <label className="flex-1 text-xs text-zinc-500">
              Daily goal
              <input
                inputMode="numeric"
                value={goal}
                onChange={(e) => setGoal(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-base text-zinc-900 outline-none focus:border-zinc-900"
              />
            </label>
            <label className="flex-[2] text-xs text-zinc-500">
              Unit
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                maxLength={16}
                placeholder="glasses, pages, minutes…"
                className="mt-1 h-12 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-base text-zinc-900 outline-none focus:border-zinc-900"
              />
            </label>
          </div>
        )}
        {!counted && <div className="mb-5" />}

        <span className={label}>Routine · {days.length ? routineLabel(days) : "pick at least one day"}</span>
        <div className="mb-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setDays(p.days)}
              className="min-h-9 rounded-full border border-zinc-200 px-3 text-xs font-medium text-zinc-700 active:bg-zinc-100"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mb-6 grid grid-cols-7 gap-1.5">
          {DAY_LETTERS.map((l, i) => {
            const on = days.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                aria-label={DAY_NAMES[i]}
                aria-pressed={on}
                className="grid h-11 place-items-center rounded-xl border text-sm font-medium"
                style={on ? { backgroundColor: color, borderColor: color, color: "#fff" } : { borderColor: "var(--line)", color: "var(--color-zinc-600)" }}
              >
                {l}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={!valid}
          className="h-12 w-full rounded-xl text-base font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {initial ? "Save changes" : "Add habit"}
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            className="mt-2 h-11 w-full rounded-xl text-sm font-medium text-red-600 active:bg-red-50"
          >
            {confirmDelete ? "Tap again to delete this habit and its history" : "Delete habit"}
          </button>
        )}
      </form>
    </div>
  );
}
