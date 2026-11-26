import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { store } from "../lib/store";
import { lockScroll } from "../lib/smooth";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

const LINES: [string, string][] = [
  ["", "JOAN-BIOS v2.0.0 — (c) 2018-2026 joansiitoh"],
  ["", "cpu: caffeine-powered @ 3.0 cups/day"],
  ["", ""],
  ["ok", "Mounted /home/joan"],
  ["ok", "Reached target Network (barcelona, es)"],
  ["ok", "Started coffee.service"],
  ["ok", "Loaded modules: react · gsap · webgl2 · lenis"],
  ["ok", "Compiled 5 featured projects"],
  ["..", "Linking side projects (still counting)"],
  ["ok", "Started portfolio.target"],
];

const KEY = "joan.booted";

/**
 * A ~2s kernel-style boot log that wipes away into the hero.
 * Shown once per session, skippable with any key / click, and skipped
 * entirely with prefers-reduced-motion.
 */
export default function BootSequence() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(() => {
    try {
      return prefersReducedMotion() || sessionStorage.getItem(KEY) === "1";
    } catch {
      return prefersReducedMotion();
    }
  });

  useEffect(() => {
    if (done) {
      store.set({ booted: true });
      return;
    }
    lockScroll(true);
    return () => lockScroll(false);
  }, [done]);

  useGSAP(
    () => {
      if (done) return;
      const q = gsap.utils.selector(root);
      const finish = () => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        lockScroll(false);
        store.set({ booted: true });
      };

      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.set(q("[data-line]"), { opacity: 0 })
        .to(q("[data-line]"), { opacity: 1, duration: 0.01, stagger: 0.11 })
        .to(q("[data-bar]"), { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.1)
        .to(q("[data-pct]"), { textContent: 100, snap: { textContent: 1 }, duration: 1.1, ease: "power2.inOut" }, 0.1)
        .to(q("[data-log]"), { opacity: 0, y: -12, duration: 0.25 }, "+=0.15")
        .call(finish)
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "slam" }, "<")
        .call(() => setDone(true));

      const skip = () => tl.progress() < 0.8 && tl.timeScale(6);
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
      };
    },
    { scope: root, dependencies: [done] },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Booting portfolio"
      className="fixed inset-0 z-[150] flex items-end bg-bg p-5 text-[13px] leading-relaxed md:p-10 md:text-sm"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div data-log className="w-full max-w-3xl">
        {LINES.map(([status, text], i) => (
          <p key={i} data-line className="min-h-[1.6em] whitespace-pre text-dim">
            {status === "ok" && (
              <>
                [<span className="text-accent">&nbsp;&nbsp;OK&nbsp;&nbsp;</span>]{" "}
              </>
            )}
            {status === ".." && (
              <>
                [<span className="text-[var(--warn)]">&nbsp;&nbsp;..&nbsp;&nbsp;</span>]{" "}
              </>
            )}
            <span className={status ? "text-fg" : ""}>{text}</span>
          </p>
        ))}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-[3px] flex-1 bg-line">
            <div data-bar className="h-full origin-left scale-x-0 bg-accent" />
          </div>
          <span className="w-12 text-right text-fg tabular-nums">
            <span data-pct>0</span>%
          </span>
        </div>
        <p className="mt-4 text-xs text-mute">press any key to skip</p>
      </div>
    </div>
  );
}
