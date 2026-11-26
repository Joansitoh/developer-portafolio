import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * A terminal block caret that trails the pointer. Over links and buttons it
 * opens into a bracketed frame; elements with `data-cursor="label"` show a
 * short label inside it.
 */
export default function Cursor() {
  const caret = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = caret.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3" });

    let current: Element | null = null;
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(el, { opacity: 1, duration: 0.2, overwrite: "auto" });

      const hit = (e.target as Element | null)?.closest("a,button,[data-cursor],input,textarea,label") ?? null;
      if (hit === current) return;
      current = hit;
      const isText = hit?.matches("input,textarea");
      const text = hit?.getAttribute("data-cursor-label") ?? "";
      if (label.current) label.current.textContent = text;
      el.dataset.state = !hit ? "idle" : isText ? "text" : text ? "label" : "link";
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    const down = () => gsap.to(el, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(el, { scale: 1, duration: 0.3, ease: "back.out(3)" });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  });

  return (
    <div
      ref={caret}
      data-state="idle"
      aria-hidden="true"
      className="cursor-caret pointer-events-none fixed left-0 top-0 z-[200] hidden mix-blend-difference [@media(pointer:fine)]:block"
    >
      <span ref={label} className="cursor-label" />
    </div>
  );
}
