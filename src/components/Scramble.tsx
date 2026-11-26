import { useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { gsap, GLYPHS } from "../lib/gsap";

type Props<T extends ElementType> = {
  as?: T;
  text: string;
  /** Element that starts the scramble: itself (default) or its closest link/button. */
  trigger?: "self" | "parent";
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/** Text that decodes itself through random glyphs on hover / focus. */
export default function Scramble<T extends ElementType = "span">({ as, text, trigger = "self", ...rest }: Props<T>) {
  const Tag = (as ?? "span") as ElementType;
  const outer = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = trigger === "parent" ? outer.current?.closest("a,button") ?? outer.current : outer.current;
    const target = inner.current;
    if (!host || !target) return;
    let tween: gsap.core.Tween | null = null;
    const run = () => {
      if (tween?.isActive()) return;
      tween = gsap.to(target, {
        duration: Math.min(0.9, 0.25 + text.length * 0.03),
        scrambleText: { text, chars: GLYPHS, speed: 0.6, revealDelay: 0.05 },
        ease: "none",
      });
    };
    host.addEventListener("mouseenter", run);
    host.addEventListener("focus", run);
    return () => {
      host.removeEventListener("mouseenter", run);
      host.removeEventListener("focus", run);
      tween?.kill();
    };
  }, [text, trigger]);

  return (
    <Tag ref={outer} {...rest}>
      <span className="sr-only">{text}</span>
      <span ref={inner} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
