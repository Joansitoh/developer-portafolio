import { useSyncExternalStore } from "react";
import type { SectionId } from "../content/profile";
import { applyAccent, isAccent, type AccentName } from "./themes";

interface State {
  booted: boolean;
  terminalOpen: boolean;
  accent: AccentName;
  crt: boolean;
  active: SectionId;
  /** Lighter rendering for slow machines: no grain, cheaper shader. */
  lite: boolean;
  perf: Perf;
}

export type Perf = "auto" | "lite" | "full";

const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: preferences just won't persist */
  }
}

const savedAccent = read<string>("joan.accent", "phosphor");
const savedPerf = read<Perf>("joan.perf", "auto");

/** Cheap up-front guess; App refines it with a short FPS probe. */
function weakDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}

let state: State = {
  booted: false,
  terminalOpen: false,
  accent: isAccent(savedAccent) ? savedAccent : "phosphor",
  crt: read<boolean>("joan.crt", true),
  active: "home",
  perf: savedPerf,
  lite: savedPerf === "lite" || (savedPerf === "auto" && weakDevice()),
};

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    if (patch.accent) {
      applyAccent(patch.accent);
      write("joan.accent", patch.accent);
    }
    if (patch.perf) write("joan.perf", patch.perf);
    if (patch.lite !== undefined) document.documentElement.classList.toggle("lite", patch.lite);
    if (patch.crt !== undefined) {
      document.documentElement.classList.toggle("no-crt", !patch.crt);
      write("joan.crt", patch.crt);
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

// Apply persisted preferences before the first paint of the app.
applyAccent(state.accent);
document.documentElement.classList.toggle("no-crt", !state.crt);
document.documentElement.classList.toggle("lite", state.lite);

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}
