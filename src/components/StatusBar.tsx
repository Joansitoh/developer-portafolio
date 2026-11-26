import { useEffect, useRef, useState } from "react";
import { profile, sections, type SectionId } from "../content/profile";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { scrollToId } from "../lib/smooth";
import { store, useStore } from "../lib/store";

function Clock() {
  const fmt = () =>
    new Date().toLocaleTimeString("en-GB", { timeZone: profile.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

/**
 * tmux-style status line pinned to the bottom: it's the navigation
 * (each section is a "window"), a scroll meter and a terminal launcher.
 */
export default function StatusBar() {
  const active = useStore((s) => s.active);
  const booted = useStore((s) => s.booted);
  const bar = useRef<HTMLElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const triggers = sections.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 55%",
        end: "bottom 55%",
        refreshPriority: -1,
        onToggle: (self) => self.isActive && store.set({ active: s.id as SectionId }),
      }),
    );
    const meter = ScrollTrigger.create({
      start: 0,
      end: "max",
      refreshPriority: -1,
      onUpdate: (self) => {
        if (pct.current) pct.current.textContent = String(Math.round(self.progress * 100)).padStart(3, " ");
      },
    });
    return () => {
      triggers.forEach((t) => t.kill());
      meter.kill();
    };
  });

  useGSAP(
    () => {
      if (!booted) return;
      gsap.from(bar.current, { yPercent: 100, duration: 0.8, delay: 1.2, ease: "term" });
    },
    { dependencies: [booted] },
  );

  return (
    <nav
      ref={bar}
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-[100] flex h-[var(--status-h)] items-stretch border-t border-line bg-bg/85 text-[11px] backdrop-blur-md sm:text-xs"
    >
      <button
        onClick={() => scrollToId("home")}
        className="flex items-center bg-accent px-3 font-bold text-accent-ink"
        data-cursor
        aria-label="Back to top"
      >
        [{profile.handle}]
      </button>
      <ol className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
        {sections.map((s, i) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="flex">
              <button
                onClick={() => scrollToId(s.id)}
                aria-current={on ? "location" : undefined}
                className={`flex items-center gap-1 px-2.5 transition-colors sm:px-3 ${on ? "bg-bg-3 text-fg" : "text-dim hover:text-fg"}`}
              >
                <span className={on ? "text-accent" : "text-mute"}>{i}</span>
                <span className="hidden sm:inline">:{s.label}</span>
                <span className={`${on ? "text-accent" : "text-transparent"}`}>*</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="hidden items-center gap-4 px-4 text-dim md:flex">
        <span>
          scroll <span ref={pct} className="whitespace-pre text-fg tabular-nums">  0</span>%
        </span>
        <span className="text-mute">│</span>
        <span>
          bcn <Clock />
        </span>
      </div>
      <button
        onClick={() => store.set({ terminalOpen: true })}
        className="flex items-center gap-2 border-l border-line px-3 text-fg transition-colors hover:bg-accent hover:text-accent-ink"
        aria-label="Open terminal"
        data-cursor
      >
        <span className="font-bold">&gt;_</span>
        <span className="hidden lg:inline">terminal</span>
        <span className="kbd hidden lg:inline-flex">`</span>
      </button>
    </nav>
  );
}
