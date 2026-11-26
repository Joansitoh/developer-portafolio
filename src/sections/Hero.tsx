import { Fragment, useRef } from "react";
import AsciiField from "../components/AsciiField";
import Magnetic from "../components/Magnetic";
import Rich from "../components/Rich";
import Scramble from "../components/Scramble";
import { profile } from "../content/profile";
import { GLYPHS, gsap, SplitText, useGSAP } from "../lib/gsap";
import { scrollToId } from "../lib/smooth";
import { store, useStore } from "../lib/store";
import { prefersReducedMotion, useMediaQuery } from "../hooks/useReducedMotion";

const NAME = profile.name.toUpperCase().split("");
const W_REST = 260;
const W_PEAK = 800;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const booted = useStore((s) => s.booted);
  const small = useMediaQuery("(max-width: 767px)");

  // Variable-font proximity: letters get heavier as the cursor approaches.
  useGSAP(
    () => {
      if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root.current);
      const weights = letters.map(() => W_REST);
      const shown = letters.map(() => W_REST);
      const pointer = { x: -1e4, y: -1e4 };
      // letter centres in page coordinates, measured once (not every frame)
      let centres: { x: number; y: number; r: number }[] = [];
      const measure = () => {
        centres = letters.map((el) => {
          const b = el.getBoundingClientRect();
          return { x: b.left + b.width / 2, y: b.top + window.scrollY + b.height / 2, r: b.height * 1.1 };
        });
      };
      measure();
      let settled = true;
      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY + window.scrollY;
        settled = false;
      };
      const tick = () => {
        if (settled || window.scrollY > window.innerHeight) return;
        let moving = false;
        letters.forEach((el, i) => {
          const c = centres[i];
          const t = Math.max(0, 1 - Math.hypot(pointer.x - c.x, pointer.y - c.y) / c.r);
          const target = W_REST + (W_PEAK - W_REST) * t * t;
          weights[i] += (target - weights[i]) * 0.14;
          if (Math.abs(target - weights[i]) > 0.5) moving = true;
          const w = Math.round(weights[i]);
          if (w !== shown[i]) {
            shown[i] = w;
            el.style.fontVariationSettings = `"wght" ${w}`;
          }
        });
        settled = !moving;
      };
      const ro = new ResizeObserver(measure);
      ro.observe(root.current!);
      window.addEventListener("pointermove", onMove, { passive: true });
      gsap.ticker.add(tick);
      return () => {
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        gsap.ticker.remove(tick);
      };
    },
    { scope: root },
  );

  // Intro: hidden on mount, played once the boot log has wiped away.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) {
        // no movement, just a soft fade so the page doesn't pop in
        gsap.fromTo(q("[data-in]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, stagger: 0.04, ease: "power1.out" });
        return;
      }
      if (!booted) {
        gsap.set(q("[data-in]"), { autoAlpha: 0 });
        return;
      }

      const pitch = SplitText.create(q("[data-pitch]"), { type: "words", mask: "words" });
      // reveal first so every .from() below records "visible" as its end state
      gsap.set(q("[data-in]"), { autoAlpha: 1 });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(q("[data-field]"), { autoAlpha: 0, duration: 2.4, ease: "power2.out" }, 0)
        .from(q("[data-top] > *"), { y: -20, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.1)
        .to(q("[data-whoami]"), { duration: 0.6, scrambleText: { text: "whoami", chars: "lowerCase", speed: 1 }, ease: "none" }, 0.2)
        .from(q("[data-letter] > span"), { yPercent: 105, duration: 1.2, stagger: 0.07, ease: "slam" }, 0.45);
      q("[data-letter] > span").forEach((el, i) => {
        tl.to(el, { duration: 1, scrambleText: { text: NAME[i], chars: GLYPHS, speed: 0.5 }, ease: "none" }, 0.5 + i * 0.07);
      });
      tl.from(q("[data-dot]"), { scale: 0, duration: 0.6, ease: "back.out(3)" }, 1.2)
        .from(q("[data-role]"), { autoAlpha: 0, x: -12, duration: 0.6 }, 1.1)
        .from(pitch.words, { yPercent: 100, duration: 0.8, stagger: 0.018 }, 1.2)
        .from(q("[data-cta] > *"), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 1.45)
        .from(q("[data-meta] > *"), { autoAlpha: 0, x: 16, stagger: 0.06, duration: 0.6 }, 1.5)
        .from(q("[data-cue]"), { autoAlpha: 0, duration: 0.8 }, 1.8);

      // Rotating role, decoded glyph by glyph.
      const roleEl = q("[data-role-text]")[0];
      const roles = gsap.timeline({ repeat: -1, delay: 2.4 });
      profile.roles.forEach((role) => {
        roles.to(roleEl, { duration: 0.9, scrambleText: { text: role, chars: GLYPHS, speed: 0.7 }, ease: "none" }).to({}, { duration: 2.2 });
      });

      // Scroll-out: the name lifts and dims as the hero leaves.
      gsap.to(q("[data-name]"), {
        yPercent: -25,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q("[data-field]"), {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return () => {
        pitch.revert();
        roles.kill();
      };
    },
    { scope: root, dependencies: [booted] },
  );

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-[100svh] flex-col overflow-hidden pb-[calc(var(--status-h)+1.5rem)]"
    >
      {/* background */}
      <div
        data-field
        data-in
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_120%_90%_at_70%_40%,#000_35%,transparent_85%)]"
      >
        <AsciiField intensity={small ? 0.5 : 0.95} cell={small ? 12 : 14} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg to-transparent" />

      {/* top line */}
      <div data-top className="shell-wrap relative z-10 flex items-center justify-between pt-5 text-xs text-dim md:pt-7">
        <span data-in>
          <span className="text-fg">~/{profile.handle}</span> <span className="hidden text-mute sm:inline">— portfolio v2.0.0</span>
        </span>
        {profile.available && (
          <span data-in className="flex items-center gap-2.5 rounded-full border border-line-2 bg-bg/80 px-3 py-1.5">
            <span className="pulse-dot" />
            <span className="whitespace-nowrap text-fg">{profile.availability}</span>
          </span>
        )}
      </div>

      {/* main */}
      <div className="shell-wrap relative z-10 mt-auto grid gap-10 pt-24 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p data-in className="mb-2 text-sm text-dim md:text-base">
            <span className="text-accent">{profile.handle}@bcn</span>
            <span className="text-mute">:</span>~<span className="text-mute">$ </span>
            <span data-whoami className="text-fg">
              whoami
            </span>
          </p>

          <h1 data-name data-in className="relative -ml-[0.04em] select-none" aria-label={`${profile.name}, ${profile.roles[0]}`}>
            <span aria-hidden="true" className="flex items-end text-[clamp(6.5rem,31vw,23rem)] leading-[0.78] tracking-[-0.06em]">
              {NAME.map((ch, i) => (
                <span key={i} data-letter className="inline-block overflow-hidden" style={{ fontVariationSettings: `"wght" ${W_REST}` }}>
                  <span className="inline-block">{ch}</span>
                </span>
              ))}
              <span data-dot className="mb-[0.08em] ml-[0.05em] inline-block h-[0.14em] w-[0.14em] animate-[blink_1.05s_steps(1)_3s_infinite] bg-accent" />
            </span>
          </h1>

          <p data-role data-in className="mt-6 flex flex-wrap items-baseline gap-x-3 text-lg md:text-2xl">
            <span className="text-accent">&gt;</span>
            <span data-role-text className="caret text-fg">
              {profile.roles[0]}
            </span>
          </p>

          <p data-pitch data-in className="mt-5 max-w-xl text-base leading-relaxed text-dim md:text-lg">
            <Rich text={profile.pitch} accent={false} />
          </p>

          <div data-cta className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <button className="btn-term primary" onClick={() => scrollToId("work")} data-in>
                <span className="text-mute">$</span>
                <Scramble text="ls ~/projects" trigger="parent" />
              </button>
            </Magnetic>
            <Magnetic>
              <button className="btn-term" onClick={() => scrollToId("contact")} data-in>
                <span className="text-mute">$</span>
                <Scramble text="ssh hello@joan" trigger="parent" />
              </button>
            </Magnetic>
            <button
              data-in
              onClick={() => store.set({ terminalOpen: true })}
              className="ml-1 hidden items-center gap-2 text-xs text-dim transition-colors hover:text-fg sm:flex"
            >
              or press <span className="kbd">`</span> for a real shell
            </button>
          </div>
        </div>

        <dl data-meta className="hidden gap-y-2 text-xs lg:grid lg:grid-cols-[auto_auto] lg:gap-x-6 lg:pb-3">
          {[
            ["loc", "41.38°N 2.17°E"],
            ["since", String(profile.since)],
            ["focus", "web · systems · tooling"],
            ["mode", "building"],
          ].map(([k, v]) => (
            <Fragment key={k}>
              <dt className="text-mute">{k}</dt>
              <dd className="text-fg">{v}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      {/* scroll cue */}
      <div data-cue data-in className="shell-wrap relative z-10 mt-12 flex items-center gap-3 text-[11px] tracking-widest text-mute uppercase">
        <span className="relative block h-8 w-px overflow-hidden bg-line-2">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_cubic-bezier(.7,0,.2,1)_infinite] bg-accent" />
        </span>
        scroll to compile
      </div>
    </section>
  );
}
