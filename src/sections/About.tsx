import { useRef } from "react";
import SectionHeader from "../components/SectionHeader";
import { uptime } from "../components/terminal/commands";
import { archive, profile, projects, stack } from "../content/profile";
import { GLYPHS, gsap, SplitText, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

const LOGO = `  ▄▄▄▄▄▄▄▄▄
        ███
        ███
  ▄▄▄   ███
  ▀███▄▄██▀
    ▀▀▀▀▀`;

const STATS = [
  { value: new Date().getFullYear() - profile.since, suffix: "+", label: "years writing code" },
  { value: projects.length + archive.length, suffix: "", label: "public projects shipped" },
  { value: stack[0].items.length, suffix: "", label: "languages in the toolbox" },
];

function Neofetch() {
  const rows = profile.neofetch.map(([k, v]) => [k, k === "uptime" ? uptime() : v]);
  return (
    <div data-neofetch className="relative overflow-hidden border border-line-2 bg-bg-2/80 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[11px] text-dim">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--warn)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ok)]" />
        <span className="ml-2">~ — neofetch</span>
      </div>
      <div className="grid gap-6 p-5 text-[12.5px] leading-[1.7] sm:grid-cols-[auto_1fr] sm:p-6">
        <pre data-logo className="hidden text-accent leading-[1.15] sm:block" aria-hidden="true">
          {LOGO}
        </pre>
        <div>
          <p data-nf-row>
            <span className="text-accent">{profile.handle}</span>
            <span className="text-mute">@</span>
            <span className="text-accent">barcelona</span>
          </p>
          <p data-nf-row className="text-mute">
            {"-".repeat(profile.handle.length + 10)}
          </p>
          {rows.map(([k, v]) => (
            <p data-nf-row key={k} className="flex gap-3">
              <span className="w-14 shrink-0 text-accent">{k}</span>
              <span data-nf-value data-value={v} className="text-fg">
                {v}
              </span>
            </p>
          ))}
          <div data-nf-row className="mt-4 flex">
            {["#1a1d21", "#ff5f56", "#27c93f", "#ffbd2e", "#82aaff", "#c792ea", "var(--accent)", "#ebe9e4"].map((c) => (
              <span key={c} className="h-4 w-6" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // Words light up as you read — scrubbed to the scroll position.
      const split = SplitText.create(q("[data-read]"), { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: q("[data-read-wrap]")[0], start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        },
      );

      // neofetch "runs" when it enters the viewport
      const tl = gsap.timeline({ scrollTrigger: { trigger: q("[data-neofetch]")[0], start: "top 80%", once: true } });
      tl.from(q("[data-neofetch]"), { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "slam" })
        .from(q("[data-logo]"), { autoAlpha: 0, x: -10, duration: 0.6 }, 0.4)
        .from(q("[data-nf-row]"), { autoAlpha: 0, duration: 0.01, stagger: 0.06 }, 0.45);
      q("[data-nf-value]").forEach((el, i) => {
        tl.to(el, { duration: 0.6, scrambleText: { text: el.dataset.value ?? "", chars: GLYPHS, speed: 0.6 }, ease: "none" }, 0.6 + i * 0.06);
      });

      // counters
      q("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        gsap.fromTo(
          el,
          { textContent: 0 },
          {
            textContent: to,
            snap: { textContent: 1 },
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });
      gsap.from(q("[data-stat]"), {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        scrollTrigger: { trigger: q("[data-stats]")[0], start: "top 90%", once: true },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="relative py-28 md:py-40">
      <div className="shell-wrap">
        <SectionHeader index={1} label="about" cmd="cat about.md" title="Small, sharp tools. *Interfaces* that feel instant." />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div data-read-wrap className="space-y-7 text-lg leading-relaxed md:text-[1.35rem] md:leading-[1.6] lg:col-span-7">
            {profile.about.map((p, i) => (
              <p key={i} data-read className={i === 0 ? "text-fg" : "text-fg"}>
                {p}
              </p>
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Neofetch />
            </div>
          </div>
        </div>

        <div data-stats className="mt-24 grid border-t border-line sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              data-stat
              className={`py-8 sm:px-8 ${i > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : "sm:pl-0"}`}
            >
              <p className="text-[clamp(3rem,7vw,5.5rem)] leading-none font-bold tracking-[-0.05em]">
                <span data-count={s.value}>{s.value}</span>
                <span className="text-accent">{s.suffix}</span>
              </p>
              <p className="mt-3 text-sm text-dim">
                <span className="text-mute">// </span>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
