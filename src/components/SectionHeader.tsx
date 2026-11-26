import { useRef } from "react";
import { gsap, SplitText, useGSAP, GLYPHS } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";
import Rich from "./Rich";

interface Props {
  index: number;
  label: string;
  cmd: string;
  title: string;
  className?: string;
}

/**
 * `01 // about ───────`
 * `joan@bcn:~$ cat about.md`
 * A big heading whose lines rise out of a mask once the prompt has "run".
 */
export default function SectionHeader({ index, label, cmd, title, className = "" }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q("[data-title]"), { type: "lines", mask: "lines", linesClass: "pb-[0.08em]" });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
      });
      tl.from(q("[data-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "slam" })
        .from(q("[data-meta]"), { opacity: 0, y: 8, stagger: 0.06, duration: 0.5 }, 0)
        .from(q("[data-prompt]"), { opacity: 0, duration: 0.2 }, 0.15)
        .to(q("[data-cmd]"), { duration: 0.6, scrambleText: { text: cmd, chars: GLYPHS, speed: 0.8 }, ease: "none" }, 0.2)
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.45);
      return () => split.revert();
    },
    { scope: root },
  );

  const num = String(index).padStart(2, "0");
  return (
    <header ref={root} className={`mb-14 md:mb-20 ${className}`}>
      <div className="mb-5 flex items-center gap-3 text-xs tracking-wider text-dim uppercase">
        <span data-meta className="text-accent">
          {num}
        </span>
        <span data-meta className="text-mute">
          //
        </span>
        <span data-meta>{label}</span>
        <span data-rule className="h-px flex-1 bg-line-2" />
      </div>
      <p data-prompt className="mb-6 text-sm text-dim">
        <span className="text-accent">joan@bcn</span>
        <span className="text-mute">:</span>
        <span className="text-fg">~</span>
        <span className="text-mute">$ </span>
        <span data-cmd className="text-fg">
          {cmd}
        </span>
      </p>
      <h2
        data-title
        className="max-w-5xl text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.95] font-bold tracking-[-0.045em] text-balance"
      >
        <Rich text={title} />
      </h2>
    </header>
  );
}
