"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  MAX_BACKUP_BYTES,
  applyBackup,
  backupFileName,
  buildBackup,
  parseBackup,
  type ParsedBackup,
} from "@/lib/backup";
import { parseHabits, readHabitsRaw, readRaw, subscribe } from "@/lib/store";

export default function SettingsData() {
  const habitsRaw = useSyncExternalStore(subscribe, readHabitsRaw, () => null);
  const dataRaw = useSyncExternalStore(subscribe, readRaw, () => "");
  const habitCount = useMemo(() => (habitsRaw === null ? 0 : parseHabits(habitsRaw).length), [habitsRaw]);
  const loggedDays = useMemo(() => {
    try {
      const d: Record<string, Record<string, number>> = dataRaw ? JSON.parse(dataRaw) : {};
      return Object.values(d).reduce((sum, days) => sum + Object.keys(days).length, 0);
    } catch {
      return 0;
    }
  }, [dataRaw]);

  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  if (habitsRaw === null) return null;

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ kind: "ok", text: `Saved ${backupFileName()}` });
  };

  const onFile = async (file: File | undefined) => {
    setMessage(null);
    setPending(null);
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) return setMessage({ kind: "error", text: "That file is too large to be a backup." });
    const result = parseBackup(await file.text());
    if (!result.ok) return setMessage({ kind: "error", text: result.error });
    setPending(result.backup);
  };

  const apply = (mode: "merge" | "replace") => {
    if (!pending) return;
    applyBackup(pending, mode);
    setMessage({ kind: "ok", text: mode === "merge" ? "Backup merged into your data." : "Your data was replaced with the backup." });
    setPending(null);
  };

  const btn =
    "h-11 touch-manipulation rounded-lg px-4 text-sm font-medium [-webkit-tap-highlight-color:transparent] active:scale-95";

  return (
    <section className="mx-auto mt-10 w-full max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">Your data</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Everything is stored in this browser. Export a backup file to keep it safe, move it to another device, or share it. Import
        one to bring it back.
      </p>

      <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
        <p className="text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{habitCount}</span> {habitCount === 1 ? "habit" : "habits"} ·{" "}
          <span className="font-semibold text-zinc-900">{loggedDays}</span> {loggedDays === 1 ? "day" : "days"} logged
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={exportFile} className={`${btn} bg-zinc-900 text-white dark:text-black`}>
            Export backup
          </button>
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={`${btn} border text-zinc-800`}
            style={{ borderColor: "var(--line)" }}
          >
            Import backup
          </button>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = ""; // allow choosing the same file again
            }}
          />
        </div>

        {pending && (
          <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: "var(--chip)" }}>
            <p className="text-sm text-zinc-800">
              Found <span className="font-semibold">{pending.habits.length}</span> {pending.habits.length === 1 ? "habit" : "habits"} and{" "}
              <span className="font-semibold">{pending.loggedDays}</span> logged {pending.loggedDays === 1 ? "day" : "days"}.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              <strong>Merge</strong> keeps what you have and adds what&apos;s new. <strong>Replace</strong> swaps your data for the backup.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => apply("merge")} className={`${btn} bg-zinc-900 text-white dark:text-black`}>
                Merge
              </button>
              <button type="button" onClick={() => apply("replace")} className={`${btn} bg-red-600 text-white`}>
                Replace
              </button>
              <button type="button" onClick={() => setPending(null)} className={`${btn} text-zinc-700 active:bg-zinc-100`}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p role="status" className={`mt-3 text-sm ${message.kind === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
