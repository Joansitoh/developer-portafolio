import { useRef } from "react";
import Marquee from "../components/Marquee";
import SectionHeader from "../components/SectionHeader";
import { stack } from "../content/profile";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

const all = stack.flatMap((s) => s.items);
const half = Math.ceil(all.length / 2);

export default function Stack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // each directory "prints" its tree line by line, like the command output
      q("[data-dir]").forEach((dir) => {
        const lines = dir.querySelectorAll("[data-tline]");
        gsap.fromTo(
          lines,
          { autoAlpha: 0, x: -8 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.045,
            ease: "power2.out",
            scrollTrigger: { trigger: dir, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section id="stack" ref={root} className="relative overflow-hidden py-28 md:py-40">
      <div className="shell-wrap">
        <SectionHeader index={3} label="stack" cmd="tree ~/stack -L 2" title="The *toolbox*, sorted by where it runs." />

        <p className="mb-8 text-sm text-fg">
          <span className="text-accent">~/stack</span>
        </p>
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((s, si) => {
            const lastDir = si === stack.length - 1;
            return (
              <div key={s.dir} data-dir className="text-sm leading-[1.9]">
                <p data-tline className="whitespace-pre">
                  <span className="text-mute">{lastDir ? "└── " : "├── "}</span>
                  <span className="font-bold text-accent">{s.dir}/</span>
                  <span className="text-mute">  # {s.note}</span>
                </p>
                <ul>
                  {s.items.map((item, i) => (
                    <li key={item} data-tline className="group flex whitespace-pre">
                      <span className="text-mute">
                        {lastDir ? "    " : "│   "}
                        {i === s.items.length - 1 ? "└── " : "├── "}
                      </span>
                      <span className="text-fg transition-colors group-hover:text-accent">{item}</span>
                      <span className="ml-2 text-accent opacity-0 transition-opacity group-hover:opacity-100">←</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-xs text-mute">
          {stack.length} directories, {all.length} files
        </p>
      </div>

      <div className="mt-24 space-y-2 md:mt-32">
        <Marquee speed={46}>
          {all.slice(0, half).map((t) => (
            <span key={t} className="flex items-center px-6 text-[clamp(2.5rem,7vw,6.5rem)] leading-[1.1] font-bold tracking-[-0.04em] text-fg">
              {t}
              <span className="ml-12 text-accent">✦</span>
            </span>
          ))}
        </Marquee>
        <Marquee speed={52} reverse>
          {all.slice(half).map((t) => (
            <span
              key={t}
              className="flex items-center px-6 text-[clamp(2.5rem,7vw,6.5rem)] leading-[1.1] font-bold tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_var(--dim)]"
            >
              {t}
              <span className="serif ml-12 text-[0.8em] text-accent [-webkit-text-stroke:0]">/</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
