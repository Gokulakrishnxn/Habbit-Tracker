"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import HabitForm from "@/components/HabitForm";
import HabitIcon from "@/components/HabitIcon";
import { routineLabel, type Habit, type HabitData } from "@/lib/habits";
import { parseHabits, readHabitsRaw, readRaw, removeHabit, subscribe, upsertHabit } from "@/lib/store";

export default function SettingsHabits() {
  // null on the server so the first client render matches the server HTML.
  const habitsRaw = useSyncExternalStore(subscribe, readHabitsRaw, () => null);
  const dataRaw = useSyncExternalStore(subscribe, readRaw, () => "");
  const habits = useMemo(() => (habitsRaw === null ? [] : parseHabits(habitsRaw)), [habitsRaw]);
  const data = useMemo<HabitData>(() => {
    try {
      return dataRaw ? JSON.parse(dataRaw) : {};
    } catch {
      return {};
    }
  }, [dataRaw]);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Habit | "new" | null>(null);

  if (habitsRaw === null) return <div className="h-64" />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <section>
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">Manage habits</h2>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="h-10 touch-manipulation rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white active:scale-95 dark:text-black"
          >
            + Add habit
          </button>
        </div>
        <p className="mb-4 text-sm text-zinc-500">
          Edit a habit or delete it. Deleting also removes everything logged for it and can&apos;t be undone.
        </p>

        {habits.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
            No habits yet. Add your first one, or head back to the{" "}
            <Link href="/" className="font-medium text-zinc-900 underline underline-offset-2">
              tracker
            </Link>
            .
          </p>
        )}

        <ul className="space-y-3">
          {habits.map((h) => {
            const logged = Object.values(data[h.id] ?? {}).filter((n) => n > 0).length;
            const confirming = confirmId === h.id;
            return (
              <li
                key={h.id}
                className="rounded-xl border p-3 transition-colors sm:p-4"
                style={{
                  borderColor: confirming ? "#ef4444" : "var(--line)",
                  backgroundColor: confirming ? "color-mix(in srgb, #ef4444 8%, transparent)" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: h.color }}>
                    <HabitIcon name={h.icon} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{h.name}</p>
                    <p className="text-xs text-zinc-500">
                      {routineLabel(h.days)} · {h.goal > 1 ? `${h.goal} ${h.unit}/day` : "Done / not done"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {logged} {logged === 1 ? "day" : "days"} logged
                    </p>
                  </div>

                  {!confirming && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(h)}
                        className="h-10 touch-manipulation rounded-lg px-3 text-sm font-medium text-zinc-700 active:bg-zinc-100 md:hover:bg-zinc-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(h.id)}
                        aria-label={`Delete ${h.name}`}
                        className="h-10 touch-manipulation rounded-lg px-3 text-sm font-medium text-red-600 active:bg-red-500/10 md:hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {confirming && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-red-500/30 pt-3">
                    <p className="text-sm text-zinc-700">
                      Delete <span className="font-semibold">{h.name}</span> and its {logged} logged {logged === 1 ? "day" : "days"}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="h-10 touch-manipulation rounded-lg px-4 text-sm font-medium text-zinc-700 active:bg-zinc-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeHabit(h.id);
                          setConfirmId(null);
                        }}
                        className="h-10 touch-manipulation rounded-lg bg-red-600 px-4 text-sm font-semibold text-white active:scale-95"
                      >
                        Yes, delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {editing && (
        <HabitForm
          initial={editing === "new" ? undefined : editing}
          onSave={(h) => {
            upsertHabit(h);
            setEditing(null);
          }}
          onDelete={
            editing === "new"
              ? undefined
              : () => {
                  removeHabit(editing.id);
                  setEditing(null);
                }
          }
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
