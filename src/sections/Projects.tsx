import { useMemo, useRef } from "react";
import SectionHeader from "../components/SectionHeader";
import Scramble from "../components/Scramble";
import { archive, projects, type Project } from "../content/profile";
import { gsap, useGSAP } from "../lib/gsap";
import { highlight } from "../lib/highlight";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

function Editor({ snippet }: { snippet: Project["snippet"] }) {
  const lines = useMemo(() => highlight(snippet.code, snippet.lang).split("\n"), [snippet]);
  return (
    <div className="flex h-full min-h-0 flex-col border border-line bg-bg/90">
      <div className="flex items-center justify-between border-b border-line text-[11px]">
        <span className="shrink-0 border-r border-t-2 border-line border-t-accent bg-bg-2 px-3 py-2 whitespace-nowrap text-fg">
          {snippet.file.split("/").pop()}
        </span>
        <span className="truncate px-3 text-mute">{snippet.file}</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4 [scrollbar-width:none] text-[11.5px] leading-[1.75] md:text-[12.5px]">
        <code>
          {lines.map((html, i) => (
            <div key={i} data-code-line className="flex">
              <span className="mr-4 w-6 shrink-0 text-right text-mute select-none">{i + 1}</span>
              <span className="whitespace-pre" dangerouslySetInnerHTML={{ __html: html || " " }} />
            </div>
          ))}
        </code>
      </pre>
      <div className="flex justify-between border-t border-line px-3 py-1.5 text-[10px] text-mute">
        <span>{snippet.lang.toUpperCase()} · UTF-8 · LF</span>
        <span>excerpt from the repo</span>
      </div>
    </div>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const num = String(i + 1).padStart(2, "0");
  return (
    <article
      data-panel
      className="relative grid w-full shrink-0 gap-6 border border-line-2 bg-bg-2 p-5 md:p-8 lg:h-[min(72vh,680px)] lg:w-[min(84vw,1180px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10"
    >
      <div className="relative flex min-w-0 flex-col">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 right-0 text-[clamp(5rem,10vw,9rem)] leading-none font-bold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_var(--line-2)]"
        >
          {num}
        </span>
        <div data-p-meta className="flex items-center gap-3 text-xs text-dim">
          <span className="text-accent">{num}</span>
          <span className="text-mute">/</span>
          <span>{String(projects.length).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-line-2" />
          <span>{p.year}</span>
        </div>
        <h3 data-p-title className="mt-6 text-[clamp(2rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.045em]">
          {p.name}
        </h3>
        <p data-p-tag className="serif mt-3 text-[clamp(1.25rem,2vw,1.75rem)] text-accent">
          {p.tagline}
        </p>
        <p data-p-desc className="mt-5 max-w-lg text-sm leading-relaxed text-dim md:text-[15px]">
          {p.description}
        </p>
        <ul data-p-stack className="mt-6 flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <li key={s} className="tag">
              {s}
            </li>
          ))}
        </ul>
        <div data-p-links className="mt-auto flex flex-wrap gap-3 pt-8">
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="btn-term primary" data-cursor-label="launch ↗">
              <span className="text-mute">$</span>
              <Scramble text="open --live" trigger="parent" />
            </a>
          )}
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="btn-term" data-cursor-label="source ↗">
              <span className="text-mute">$</span>
              <Scramble text="git clone" trigger="parent" />
            </a>
          )}
        </div>
      </div>
      <div data-p-editor className="relative z-10 min-h-[320px] min-w-0 lg:min-h-0">
        <Editor snippet={p.snippet} />
      </div>
    </article>
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reduced = prefersReducedMotion();
      const mm = gsap.matchMedia();

      const reveal = (panel: Element, trigger: ScrollTrigger.Vars) => {
        const s = gsap.utils.selector(panel);
        const tl = gsap.timeline({ scrollTrigger: { ...trigger, once: true } });
        tl.from(s("[data-p-meta], [data-p-title], [data-p-tag], [data-p-desc], [data-p-stack], [data-p-links]"), {
          y: 30,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.8,
        }).fromTo(
          s("[data-code-line]"),
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.35, stagger: 0.045, ease: "steps(12)" },
          0.2,
        );
      };

      if (reduced) return;

      // Desktop: pin the section and scroll the panels sideways.
      mm.add("(min-width: 1024px)", () => {
        const t = track.current!;
        const distance = () => t.scrollWidth - window.innerWidth;
        const scroll = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.to(q("[data-progress]"), {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: pin.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        q("[data-panel]").forEach((panel, i) => {
          if (i === 0) reveal(panel, { trigger: pin.current, start: "top 60%" });
          else reveal(panel, { trigger: panel, containerAnimation: scroll, start: "left 70%" });
          // slight depth: panels settle as they reach the centre
          gsap.fromTo(
            panel,
            { rotateY: -8, transformPerspective: 1600, transformOrigin: "left center" },
            { rotateY: 0, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: scroll, start: "left right", end: "left 30%", scrub: true } },
          );
        });
      });

      // Mobile / tablet: stacked cards, each revealed on its own.
      mm.add("(max-width: 1023px)", () => {
        q("[data-panel]").forEach((panel) => reveal(panel, { trigger: panel, start: "top 80%" }));
      });

      // archive rows
      gsap.from(q("[data-row]"), {
        autoAlpha: 0,
        y: 16,
        stagger: 0.05,
        duration: 0.6,
        scrollTrigger: { trigger: q("[data-archive]")[0], start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="relative py-28 md:py-40">
      <div className="shell-wrap">
        <SectionHeader index={2} label="work" cmd="ls ~/projects --featured" title="Things I've *shipped* lately." />
      </div>

      <div ref={pin} className="relative lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="shell-wrap mb-6 hidden items-center gap-4 text-xs text-dim lg:flex">
          <span>scroll</span>
          <div className="h-px flex-1 bg-line">
            <div data-progress className="h-full origin-left scale-x-0 bg-accent" />
          </div>
          <span>{String(projects.length).padStart(2, "0")} projects</span>
        </div>
        <div
          ref={track}
          className="shell-wrap flex flex-col gap-6 lg:w-max lg:max-w-none lg:flex-row lg:gap-8 lg:pr-[8vw] lg:[perspective:1600px]"
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </div>

      {/* archive */}
      <div data-archive className="shell-wrap mt-28 md:mt-36">
        <p className="mb-6 text-sm text-dim">
          <span className="text-accent">joan@bcn</span>
          <span className="text-mute">:</span>~<span className="text-mute">$ </span>
          <span className="text-fg">ls -la ~/archive</span>
        </p>
        <p className="mb-2 text-xs text-mute">total {archive.length}</p>
        <ul className="border-t border-line">
          {archive.map((a) => (
            <li key={a.slug} data-row>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                data-cursor-label="open ↗"
                className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden border-b border-line px-1 py-4 text-sm md:grid-cols-[7rem_4rem_minmax(0,18rem)_1fr_5rem_1.5rem] md:gap-x-6 md:px-3"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-accent/[0.07] transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:scale-x-100" />
                <span className="hidden text-mute md:block">drwxr-xr-x</span>
                <span className="text-dim tabular-nums">{a.year}</span>
                <span className="truncate text-fg transition-colors group-hover:text-accent">{a.name}</span>
                <span className="col-span-3 truncate text-dim md:col-span-1">{a.description}</span>
                <span className="hidden text-xs text-mute md:block">{a.lang}</span>
                <span className="text-right text-mute transition-all group-hover:translate-x-1 group-hover:text-accent">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
