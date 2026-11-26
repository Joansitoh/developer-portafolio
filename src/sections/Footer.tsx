import { useRef } from "react";
import AsciiField from "../components/AsciiField";
import { profile } from "../content/profile";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { scrollToId } from "../lib/smooth";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q("[data-wordmark]"), { type: "chars", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 110,
        stagger: 0.04,
        duration: 1.2,
        ease: "slam",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  const year = new Date().getFullYear();
  return (
    <footer ref={root} className="relative overflow-hidden border-t border-line pb-[calc(var(--status-h)+1.5rem)]">
      <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(to_top,#000_20%,transparent_95%)]">
        <AsciiField intensity={0.7} cell={16} rain={1} />
      </div>
      <div className="shell-wrap relative pt-28">
        <p className="text-sm text-dim">
          <span className="text-mute">$</span> echo $?
        </p>
        <p className="text-sm text-accent">0 — thanks for scrolling all the way down.</p>

        <p
          data-wordmark
          aria-hidden="true"
          className="mt-14 text-[clamp(4.5rem,19vw,18rem)] leading-[0.8] font-bold tracking-[-0.07em] whitespace-nowrap"
        >
          {profile.handle}
          <span className="text-accent">_</span>
        </p>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-dim md:flex-row md:items-center md:justify-between">
          <span>
            © {year} {profile.name} · {profile.location}
          </span>
          <span>
            compiled with React · GSAP · WebGL2 · <span className="text-fg">no templates</span>
          </span>
          <button onClick={() => scrollToId("home")} className="text-left text-fg transition-colors hover:text-accent">
            cd ~ ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
