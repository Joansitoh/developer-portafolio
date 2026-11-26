import { useLayoutEffect, useRef, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { log, type LogEntry } from "../content/profile";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

const LANE_MAIN = 14;
const LANE_SIDE = 42;
const NODE_Y = 30;

const laneColor: Record<LogEntry["branch"], string> = {
  main: "var(--accent)",
  systems: "var(--accent)",
  web: "#c792ea",
  sysadmin: "#4de3ff",
  minecraft: "#ffbd2e",
};

/** Stable fake short-hash, derived from the commit message. */
function shortHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

function Row({ entry, last }: { entry: LogEntry; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const [h, setH] = useState(200);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setH(el.offsetHeight);
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const side = entry.branch !== "main" && entry.branch !== "systems";
  const nodeX = side ? LANE_SIDE : LANE_MAIN;
  const color = laneColor[entry.branch];
  const mainPath = `M${LANE_MAIN},0 L${LANE_MAIN},${last ? NODE_Y : h}`;
  const branchPath = side
    ? `M${LANE_MAIN},0 C${LANE_MAIN},${NODE_Y * 0.6} ${LANE_SIDE},${NODE_Y * 0.4} ${LANE_SIDE},${NODE_Y} L${LANE_SIDE},${h * 0.55} C${LANE_SIDE},${h * 0.8} ${LANE_MAIN},${h * 0.75} ${LANE_MAIN},${h}`
    : "";

  return (
    <li ref={ref} data-commit className="relative grid grid-cols-[64px_1fr] pb-14 md:grid-cols-[88px_1fr]">
      <svg className="absolute top-0 left-0 overflow-visible" width="64" height={h} viewBox={`0 0 64 ${h}`} aria-hidden="true">
        <path d={mainPath} stroke="var(--line-2)" strokeWidth="1.5" fill="none" />
        {side && <path d={branchPath} stroke="var(--line-2)" strokeWidth="1.5" fill="none" />}
        <path data-draw d={mainPath} pathLength={1} strokeDasharray="1" strokeDashoffset="1" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
        {side && <path data-draw d={branchPath} pathLength={1} strokeDasharray="1" strokeDashoffset="1" stroke={color} strokeWidth="1.5" fill="none" />}
        <circle data-node cx={nodeX} cy={NODE_Y} r="6" fill="var(--bg)" stroke={color} strokeWidth="1.5" />
        <circle data-node-core cx={nodeX} cy={NODE_Y} r="2.5" fill={color} />
      </svg>
      <div />
      <div data-commit-body className="min-w-0 pt-[18px]">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-[var(--warn)]">commit {shortHash(entry.message)}</span>
          {entry.tags?.map((t) => (
            <span key={t} className="rounded-sm border px-1.5 py-px" style={{ borderColor: color, color }}>
              {t}
            </span>
          ))}
          <span className="text-mute">· {entry.branch}</span>
        </p>
        <h3 className="mt-3 flex flex-wrap items-baseline gap-x-4 text-[clamp(1.5rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.035em]">
          <span className="serif text-[0.9em] font-normal" style={{ color }}>
            {entry.date}
          </span>
          <span>
            <span className="text-dim">{entry.type}</span>
            {entry.scope && <span className="text-mute">({entry.scope})</span>}
            <span className="text-dim">: </span>
            {entry.message}
          </span>
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim md:text-base">{entry.body}</p>
      </div>
    </li>
  );
}

export default function Log() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const list = q("[data-log-list]")[0];

      // one scrubbed timeline draws the whole graph top → bottom
      const tl = gsap.timeline({
        scrollTrigger: { trigger: list, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
      });
      q("[data-commit]").forEach((row) => {
        const s = gsap.utils.selector(row);
        tl.fromTo(s("[data-draw]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 })
          .fromTo(s("[data-node]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, "<")
          .fromTo(s("[data-node-core]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25 }, "<0.1")
          .fromTo(s("[data-commit-body]"), { autoAlpha: 0.15, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, "<");
      });
    },
    { scope: root },
  );

  return (
    <section id="log" ref={root} className="relative py-28 md:py-40">
      <div className="shell-wrap">
        <SectionHeader index={4} label="log" cmd="git log --graph --oneline" title="A history of *commits*, not job titles." />
        <ol data-log-list className="max-w-4xl">
          {log.map((e, i) => (
            <Row key={e.date + e.message} entry={e} last={i === log.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
