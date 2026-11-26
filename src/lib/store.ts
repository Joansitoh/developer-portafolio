import { useSyncExternalStore } from "react";
import type { SectionId } from "../content/profile";
import { applyAccent, isAccent, type AccentName } from "./themes";

interface State {
  booted: boolean;
  terminalOpen: boolean;
  accent: AccentName;
  crt: boolean;
  active: SectionId;
}

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

let state: State = {
  booted: false,
  terminalOpen: false,
  accent: isAccent(savedAccent) ? savedAccent : "phosphor",
  crt: read<boolean>("joan.crt", true),
  active: "home",
};

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    if (patch.accent) {
      applyAccent(patch.accent);
      write("joan.accent", patch.accent);
    }
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

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}
