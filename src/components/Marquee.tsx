import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

interface Props {
  children: ReactNode;
  /** Seconds for one full loop at rest. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite marquee whose speed and skew react to scroll velocity —
 * scroll fast and the line surges, then eases back to its idle drift.
 */
export default function Marquee({ children, speed = 40, reverse = false, className = "" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dir = reverse ? 1 : -1;
      const loop = gsap.fromTo(
        inner.current,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: speed, ease: "none", repeat: -1 },
      );
      const skewTo = gsap.quickTo(inner.current, "skewX", { duration: 0.5, ease: "power3" });
      const settle = gsap
        .delayedCall(0.15, () => {
          gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true });
          skewTo(0);
        })
        .pause();
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const boost = gsap.utils.clamp(-6, 6, v / 300);
          gsap.to(loop, { timeScale: 1 + Math.abs(boost), duration: 0.25, overwrite: true });
          skewTo(gsap.utils.clamp(-10, 10, (v / 220) * dir * -1));
          settle.restart(true);
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`} aria-hidden="true">
      <div ref={inner} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
