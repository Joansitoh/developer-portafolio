import { useSyncExternalStore } from "react";

function subscribeTo(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

const REDUCED = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () => window.matchMedia(REDUCED).matches;

export function useReducedMotion() {
  return useSyncExternalStore(subscribeTo(REDUCED), prefersReducedMotion);
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(subscribeTo(query), () => window.matchMedia(query).matches);
}
