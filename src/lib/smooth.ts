import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;

/** Lenis drives the scroll, GSAP's ticker drives Lenis, ScrollTrigger listens to Lenis. */
export function startSmoothScroll(reduced: boolean) {
  if (reduced) return () => {};
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: immediate ? 0 : 1.6, immediate });
  else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}

export function lockScroll(lock: boolean) {
  if (lenis) {
    if (lock) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
