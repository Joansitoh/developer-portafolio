import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { store, useStore } from "../../lib/store";
import { lockScroll } from "../../lib/smooth";
import { profile } from "../../content/profile";
import { candidates, commands, complete, LOGO, type Ctx } from "./commands";

interface Line {
  id: number;
  node: ReactNode;
}

let nextId = 0;
const line = (node: ReactNode): Line => ({ id: nextId++, node });

const Prompt = () => (
  <span className="shrink-0 select-none">
    <span className="text-accent">{profile.handle}@bcn</span>
    <span className="text-mute">:</span>
    <span className="text-fg">~</span>
    <span className="text-mute">$&nbsp;</span>
  </span>
);

const welcome = (): Line[] => [
  line(<pre className="text-accent leading-tight text-[11px] sm:text-xs">{LOGO}</pre>),
  line(<span className="text-dim">JoanOS 2.0.0 — interactive shell. Type <span className="text-fg">help</span> to start, <span className="text-fg">Esc</span> to close.</span>),
  line(<span className="text-dim">try: <span className="text-fg">ls</span> · <span className="text-fg">neofetch</span> · <span className="text-fg">theme amber</span> · <span className="text-fg">cd contact</span></span>),
  line(""),
];

/** Quake-style drop-down shell. Toggle with ` (backtick) or Ctrl/⌘+K. */
export default function Terminal() {
  const open = useStore((s) => s.terminalOpen);
  const [lines, setLines] = useState<Line[]>(welcome);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number>(-1);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => store.set({ terminalOpen: false }), []);

  // global hotkeys
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input,textarea,[contenteditable]");
      const toggle = (e.key === "`" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k");
      if (toggle) {
        e.preventDefault();
        store.set({ terminalOpen: !store.get().terminalOpen });
      } else if (e.key === "Escape" && store.get().terminalOpen) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // open / close animation
  useGSAP(
    () => {
      const p = panel.current;
      const b = backdrop.current;
      if (!p || !b) return;
      if (open) {
        wasOpen.current = true;
        lastFocus.current = document.activeElement;
        lockScroll(true);
        gsap.set([p, b], { visibility: "visible" });
        gsap.to(b, { opacity: 1, duration: 0.3 });
        gsap.fromTo(p, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "slam" });
        setTimeout(() => input.current?.focus(), 60);
      } else {
        if (!wasOpen.current) return; // initial mount: nothing to close
        wasOpen.current = false;
        lockScroll(false);
        gsap.to(b, { opacity: 0, duration: 0.25 });
        gsap.to(p, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.4,
          ease: "slam",
          onComplete: () => {
            gsap.set([p, b], { visibility: "hidden" });
          },
        });
        if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus({ preventScroll: true });
      }
    },
    { dependencies: [open] },
  );

  // keep the newest output in view
  useEffect(() => {
    output.current?.scrollTo({ top: output.current.scrollHeight });
  }, [lines]);

  const run = async (raw: string) => {
    const text = raw.trim();
    const echo = line(
      <span className="flex">
        <Prompt />
        <span className="text-fg">{raw}</span>
      </span>,
    );
    setLines((l) => [...l, echo]);
    if (!text) return;
    const nextHistory = [...history, text];
    setHistory(nextHistory);
    setCursor(-1);

    const [name, ...args] = text.split(/\s+/);
    const ctx: Ctx = {
      print: (...nodes) => setLines((l) => [...l, ...nodes.map(line)]),
      clear: () => setLines([]),
      close,
      history: nextHistory,
    };
    const cmd = commands[name.toLowerCase()];
    if (!cmd) {
      ctx.print(
        <span>
          <span className="text-[var(--danger)]">zsh: command not found: {name}</span>
          <span className="text-dim"> — type help</span>
        </span>,
      );
      return;
    }
    await cmd.run(args, ctx);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const done = complete(value);
      if (done !== value) setValue(done);
      else {
        const opts = candidates(value);
        if (opts.length > 1) setLines((l) => [...l, line(<span className="text-dim">{opts.join("   ")}</span>)]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor < 0) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(-1);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <>
      <div
        ref={backdrop}
        onClick={close}
        className="invisible fixed inset-0 z-[120] bg-black/70 opacity-0"
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Interactive terminal"
        data-lenis-prevent
        className="invisible fixed inset-x-0 top-0 z-[130] flex h-[min(68vh,640px)] flex-col border-b border-accent/40 bg-bg-2 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]"
        style={{ clipPath: "inset(0 0 100% 0)" }}
        onClick={() => input.current?.focus()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-dim">
          <div className="flex items-center gap-2">
            <button aria-label="Close terminal" onClick={close} className="h-3 w-3 rounded-full bg-[var(--danger)]" />
            <span className="h-3 w-3 rounded-full bg-[var(--warn)]" />
            <span className="h-3 w-3 rounded-full bg-[var(--ok)]" />
            <span className="ml-3">{profile.handle}@bcn: ~ — zsh</span>
          </div>
          <span className="hidden sm:inline">
            <span className="kbd">esc</span> close · <span className="kbd">tab</span> complete · <span className="kbd">↑</span> history
          </span>
        </div>
        <div ref={output} className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed sm:px-6 sm:text-sm">
          {lines.map((l) => (
            <div key={l.id} className="min-h-[1.5em] whitespace-pre-wrap break-words">
              {l.node}
            </div>
          ))}
          <label className="flex items-center">
            <Prompt />
            <span className="sr-only">Command</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="min-w-0 flex-1 bg-transparent text-fg caret-[var(--accent)] outline-none"
            />
          </label>
        </div>
      </div>
    </>
  );
}
