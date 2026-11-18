export type Theme = "light" | "dark";
/** "system" = follow the device's light/dark setting (the default). */
export type ThemePref = "system" | Theme;

const KEY = "theme";
const EVENT = "theme:change";
const QUERY = "(prefers-color-scheme: dark)";

export function getPref(): ThemePref {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {}
  return "system";
}

export function resolve(pref: ThemePref): Theme {
  return pref === "system" ? (matchMedia(QUERY).matches ? "dark" : "light") : pref;
}

/** Snapshot string "<pref>:<resolved>" so React re-renders on either a choice or a device change. */
export const getThemeSnapshot = () => {
  const pref = getPref();
  return `${pref}:${resolve(pref)}`;
};
export const getServerThemeSnapshot = () => "system:light";

export function subscribeTheme(cb: () => void) {
  const mq = matchMedia(QUERY);
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
    mq.removeEventListener("change", cb);
  };
}

export function setPref(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Runs before first paint (inlined in <head>) so there is no light flash in dark mode. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${KEY}');if(t==='dark'||(t!=='light'&&matchMedia('${QUERY}').matches))document.documentElement.classList.add('dark')}catch(e){}`;
