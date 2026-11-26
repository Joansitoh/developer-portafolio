import { useRef, useState, type FormEvent } from "react";
import SectionHeader from "../components/SectionHeader";
import Scramble from "../components/Scramble";
import { profile } from "../content/profile";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../hooks/useReducedMotion";

const QUESTIONS = [
  { key: "name", q: "who's asking?", placeholder: "your name" },
  { key: "topic", q: "what are we building?", placeholder: "a web app, an extension, a crazy idea…" },
  { key: "message", q: "tell me a bit more", placeholder: "scope, timeline, links — anything helps" },
] as const;

type Answers = Record<(typeof QUESTIONS)[number]["key"], string>;

function Session() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ name: "", topic: "", message: "" });
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const done = step >= QUESTIONS.length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (done) return;
    const value = draft.trim();
    if (!value) return;
    const key = QUESTIONS[step].key;
    setAnswers((a) => ({ ...a, [key]: value }));
    setDraft("");
    setStep((s) => s + 1);
  };

  const send = () => {
    const subject = encodeURIComponent(`[portfolio] ${answers.topic}`);
    const body = encodeURIComponent(`Hi Joan,\n\n${answers.message}\n\n— ${answers.name}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const reset = () => {
    setStep(0);
    setAnswers({ name: "", topic: "", message: "" });
    setSent(false);
    setTimeout(() => input.current?.focus(), 0);
  };

  return (
    <div data-session className="flex min-h-[420px] flex-col border border-line-2 bg-bg-2/80 backdrop-blur" onClick={() => input.current?.focus()}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[11px] text-dim">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--warn)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ok)]" />
        <span className="ml-2">ssh hello@joan — 80×24</span>
      </div>
      <div className="flex-1 space-y-1.5 p-5 text-[13px] leading-relaxed md:p-7 md:text-sm">
        <p className="text-dim">
          <span className="text-mute">$</span> ssh hello@joan
        </p>
        <p className="text-dim">Connecting to {profile.location.toLowerCase()}… <span className="text-accent">connected</span>.</p>
        <p className="mb-4 text-dim">Three quick questions and I'll hand you over to your mail client.</p>

        {QUESTIONS.slice(0, step).map((q) => (
          <p key={q.key} className="flex flex-wrap gap-x-2">
            <span className="text-accent">✔</span>
            <span className="text-dim">{q.q}</span>
            <span className="text-fg">{answers[q.key]}</span>
          </p>
        ))}

        {!done && (
          <form onSubmit={submit} className="flex flex-wrap items-center gap-x-2">
            <span className="text-accent">?</span>
            <label htmlFor="ssh-input" className="text-fg">
              {QUESTIONS[step].q}
            </label>
            <span className="text-mute">›</span>
            <input
              id="ssh-input"
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={QUESTIONS[step].placeholder}
              spellCheck={false}
              autoComplete="off"
              className="min-w-[12rem] flex-1 bg-transparent text-fg caret-[var(--accent)] outline-none placeholder:text-mute"
            />
          </form>
        )}

        {done && (
          <div className="pt-4">
            <p className="text-dim">
              <span className="text-accent">✔</span> payload ready · {answers.message.length} bytes
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={send} className="btn-term primary">
                <span className="text-mute">$</span>
                <Scramble text={sent ? "sent — check your mail app" : "send --via mail ↵"} trigger="parent" />
              </button>
              <button onClick={reset} className="btn-term">
                <span className="text-mute">$</span> reset
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between border-t border-line px-4 py-2 text-[10px] text-mute">
        <span>
          step {Math.min(step + 1, QUESTIONS.length)}/{QUESTIONS.length}
        </span>
        <span>
          <span className="kbd">↵</span> to continue
        </span>
      </div>
    </div>
  );
}

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q("[data-session]"), {
        clipPath: "inset(0 0 100% 0)",
        duration: 1,
        ease: "slam",
        scrollTrigger: { trigger: q("[data-session]")[0], start: "top 80%", once: true },
      });
      gsap.from(q("[data-c-item]"), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.07,
        scrollTrigger: { trigger: q("[data-c-side]")[0], start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} className="relative py-28 md:py-40">
      <div className="shell-wrap">
        <SectionHeader index={5} label="contact" cmd="ssh hello@joan" title="Got something worth *building*?" />
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Session />
          </div>
          <div data-c-side className="flex flex-col gap-10 lg:col-span-5">
            <div data-c-item>
              <p className="mb-3 text-xs text-mute">// or skip the ceremony</p>
              <button
                onClick={copy}
                data-cursor-label={copied ? "copied ✔" : "copy"}
                className="group text-left text-[clamp(1.3rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em] break-all"
              >
                <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                  {profile.email}
                </span>
              </button>
              <p className="mt-2 h-4 text-xs text-accent" aria-live="polite">
                {copied ? "✔ copied to clipboard" : ""}
              </p>
            </div>

            <ul data-c-item className="border-t border-line">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-line py-4 text-sm"
                  >
                    <span>
                      <span className="text-mute">ln -s </span>
                      <span className="text-fg transition-colors group-hover:text-accent">{s.label}</span>
                    </span>
                    <span className="flex items-center gap-3 text-dim">
                      {s.handle}
                      <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent">↗</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <dl data-c-item className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-mute">based in</dt>
              <dd>{profile.location}</dd>
              <dt className="text-mute">status</dt>
              <dd className="flex items-center gap-2">
                <span className="pulse-dot" /> {profile.availability}
              </dd>
              <dt className="text-mute">timezone</dt>
              <dd>{profile.timezone} (CET)</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
