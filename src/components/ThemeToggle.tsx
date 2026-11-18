"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getServerThemeSnapshot, getThemeSnapshot, setPref, subscribeTheme, type Theme, type ThemePref } from "@/lib/theme";

const NEXT: Record<ThemePref, ThemePref> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<ThemePref, string> = { system: "Auto (device setting)", light: "Light", dark: "Dark" };

const ICONS: Record<ThemePref, string> = {
  system: "M3 5h18v11H3zM8 20h8M12 16v4", // monitor
  light: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4", // sun
  dark: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z", // moon
};

/** Cycles Auto → Light → Dark. Auto follows the device's setting live. */
export default function ThemeToggle() {
  const snap = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [pref, resolved] = snap.split(":") as [ThemePref, Theme];

  // Keep the <html> class in sync with the resolved theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  return (
    <button
      type="button"
      onClick={() => setPref(NEXT[pref])}
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[NEXT[pref]]}`}
      title={`Theme: ${LABEL[pref]}`}
      className="grid size-9 touch-manipulation place-items-center rounded-lg text-zinc-600 transition-colors [-webkit-tap-highlight-color:transparent] active:bg-zinc-100 md:hover:bg-zinc-100"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={ICONS[pref]} />
      </svg>
    </button>
  );
}
