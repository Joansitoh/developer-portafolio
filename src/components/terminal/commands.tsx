import type { ReactNode } from "react";
import { archive, log, profile, projects, sections, stack } from "../../content/profile";
import { scrollToId } from "../../lib/smooth";
import { store } from "../../lib/store";
import { accents, isAccent } from "../../lib/themes";

export interface Ctx {
  print: (...lines: ReactNode[]) => void;
  clear: () => void;
  close: () => void;
  history: string[];
}

interface Command {
  desc: string;
  usage?: string;
  hidden?: boolean;
  /** Values offered by Tab completion for the first argument. */
  complete?: () => string[];
  run: (args: string[], ctx: Ctx) => void | Promise<void>;
}

export const LOGO = [
  "  ▀▀█  ▄▀▀▀▄  ▄▀▀▀▄  █▄  █      ▄▀▀▀▀  █   █",
  "▄   █  █   █  █▀▀▀█  █ ▀▄█       ▀▀▀▄  █▀▀▀█",
  " ▀▀▀    ▀▀▀   ▀   ▀  ▀   ▀  ▀▀  ▀▀▀▀   ▀   ▀",
].join("\n");

export const uptime = () => `${new Date().getFullYear() - profile.since} years`;

const A = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;
const D = ({ children }: { children: ReactNode }) => <span className="text-dim">{children}</span>;
const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-accent underline decoration-dotted underline-offset-4 hover:decoration-solid">
    {children}
  </a>
);

const sectionIds = sections.map((s) => s.id as string);
const slugs = () => [...projects.map((p) => p.slug), ...archive.map((a) => a.slug)];

const go = (id: string, ctx: Ctx) => {
  ctx.print(<D>→ jumping to ~/{id}</D>);
  setTimeout(() => {
    ctx.close();
    scrollToId(id);
  }, 280);
};

export const commands: Record<string, Command> = {
  help: {
    desc: "list available commands",
    run: (_, { print }) => {
      print(<D>available commands — Tab autocompletes, ↑/↓ walks history</D>);
      Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .forEach(([name, c]) =>
          print(
            <span>
              <A>{(c.usage ?? name).padEnd(20, " ")}</A>
              <D>{c.desc}</D>
            </span>,
          ),
        );
    },
  },
  whoami: {
    desc: "who is this guy",
    run: (_, { print }) => {
      print(
        <span>
          <A>{profile.name}</A> <D>(@{profile.handle})</D> — {profile.roles[0]} from {profile.location}
        </span>,
        <D>{profile.pitch.replace(/\*/g, "")}</D>,
      );
    },
  },
  "cat": {
    desc: "print a file",
    usage: "cat <file>",
    complete: () => ["about.md", "contact.txt", "stack.json"],
    run: (args, ctx) => {
      const file = args[0];
      if (file === "about.md") return commands.about.run([], ctx);
      if (file === "contact.txt") return commands.contact.run([], ctx);
      if (file === "stack.json") return commands.stack.run([], ctx);
      ctx.print(<span className="text-[var(--danger)]">cat: {file ?? ""}: No such file. try about.md, contact.txt, stack.json</span>);
    },
  },
  about: {
    desc: "a few lines about me",
    hidden: true,
    run: (_, { print }) => profile.about.forEach((p) => print(p)),
  },
  ls: {
    desc: "list projects (or ls archive)",
    usage: "ls [archive]",
    complete: () => ["projects", "archive"],
    run: (args, { print }) => {
      const list = args[0] === "archive" ? archive.map((a) => ({ slug: a.slug, year: a.year, text: a.description })) : projects.map((p) => ({ slug: p.slug, year: p.year, text: p.tagline }));
      print(<D>total {list.length}</D>);
      list.forEach((p) =>
        print(
          <span>
            <D>drwxr-xr-x {p.year} </D>
            <A>{p.slug.padEnd(24, " ")}</A>
            <D>{p.text}</D>
          </span>,
        ),
      );
      print(<D>tip: open &lt;name&gt; to visit one</D>);
    },
  },
  open: {
    desc: "open a project in a new tab",
    usage: "open <project>",
    complete: slugs,
    run: (args, { print }) => {
      const slug = args[0];
      const p = projects.find((x) => x.slug === slug);
      const a = archive.find((x) => x.slug === slug);
      const url = p ? (p.live ?? p.repo) : a?.url;
      if (!url) return print(<span className="text-[var(--danger)]">open: '{slug ?? ""}' not found — try ls</span>);
      print(<D>opening {url} …</D>);
      window.open(url, "_blank", "noopener");
    },
  },
  cd: {
    desc: "jump to a section",
    usage: "cd <section>",
    complete: () => sectionIds,
    run: (args, ctx) => {
      const id = (args[0] ?? "home").replace(/^~\/?/, "") || "home";
      if (id === "..") return ctx.print(<D>you're already at the top of the world.</D>);
      if (!sectionIds.includes(id)) return ctx.print(<span className="text-[var(--danger)]">cd: no such section: {id} — try {sectionIds.join(", ")}</span>);
      go(id, ctx);
    },
  },
  stack: {
    desc: "tools I build with",
    run: (_, { print }) =>
      stack.forEach((s) =>
        print(
          <span>
            <A>{(s.dir + "/").padEnd(12, " ")}</A>
            {s.items.join(" · ")}
          </span>,
        ),
      ),
  },
  git: {
    desc: "git log of my career",
    usage: "git log",
    complete: () => ["log"],
    run: (args, { print }) => {
      if (args[0] !== "log") return print(<D>usage: git log</D>);
      log.forEach((l) =>
        print(
          <span>
            <span className="text-[var(--warn)]">* {l.date}</span> <A>{l.type}{l.scope ? `(${l.scope})` : ""}:</A> {l.message}
          </span>,
        ),
      );
    },
  },
  neofetch: {
    desc: "system info, the dev way",
    run: (_, { print }) => {
      print(<pre className="text-accent leading-tight">{LOGO}</pre>);
      profile.neofetch.forEach(([k, v]) =>
        print(
          <span>
            <A>{k.padEnd(8, " ")}</A> {k === "uptime" ? uptime() : v}
          </span>,
        ),
      );
    },
  },
  contact: {
    desc: "how to reach me",
    run: (_, { print }) => {
      print(
        <span>
          <A>{"mail".padEnd(10, " ")}</A>
          <Link href={`mailto:${profile.email}`}>{profile.email}</Link>
        </span>,
      );
      profile.socials.forEach((s) =>
        print(
          <span>
            <A>{s.label.padEnd(10, " ")}</A>
            <Link href={s.url}>{s.handle}</Link>
          </span>,
        ),
      );
    },
  },
  theme: {
    desc: "change the accent colour",
    usage: "theme <name>",
    complete: () => Object.keys(accents),
    run: (args, { print }) => {
      const name = args[0];
      if (!name || !isAccent(name)) {
        print(<D>themes: {Object.keys(accents).join(" · ")} — current: {store.get().accent}</D>);
        return;
      }
      store.set({ accent: name });
      print(<span>accent set to <A>{name}</A></span>);
    },
  },
  crt: {
    desc: "toggle scanlines & grain",
    usage: "crt [on|off]",
    complete: () => ["on", "off"],
    run: (args, { print }) => {
      const next = args[0] ? args[0] === "on" : !store.get().crt;
      store.set({ crt: next });
      print(<D>crt effects {next ? "on" : "off"}</D>);
    },
  },
  perf: {
    desc: "rendering quality",
    usage: "perf [auto|lite|full]",
    complete: () => ["auto", "lite", "full"],
    run: (args, { print }) => {
      const mode = args[0];
      if (mode !== "auto" && mode !== "lite" && mode !== "full") {
        const s = store.get();
        return print(<D>perf: {s.perf} — currently {s.lite ? "lite" : "full"} rendering. usage: perf auto|lite|full</D>);
      }
      store.set({ perf: mode, lite: mode === "lite" });
      print(<D>perf set to {mode}{mode === "full" ? " — reload for full shader resolution" : ""}</D>);
    },
  },
  history: {
    desc: "commands you ran",
    run: (_, { print, history }) => history.forEach((h, i) => print(<D>{String(i + 1).padStart(4, " ")}  {h}</D>)),
  },
  date: { desc: "local time in Barcelona", run: (_, { print }) => print(new Date().toLocaleString("en-GB", { timeZone: profile.timezone, dateStyle: "full", timeStyle: "medium" })) },
  echo: { desc: "print text", usage: "echo <text>", run: (args, { print }) => print(args.join(" ")) },
  clear: { desc: "clear the screen", run: (_, { clear }) => clear() },
  exit: { desc: "close the terminal", run: (_, { close }) => close() },
  pwd: { desc: "", hidden: true, run: (_, { print }) => print(`/home/${profile.handle}`) },
  uname: { desc: "", hidden: true, run: (_, { print }) => print("JoanOS 2.0.0 react19-gsap3 webgl2 x86_64 caffeine") },
  sudo: { desc: "", hidden: true, run: (_, { print }) => print(<span className="text-[var(--danger)]">{profile.handle} is not in the sudoers file. This incident will be reported.</span>) },
  rm: { desc: "", hidden: true, run: (_, { print }) => print(<D>nice try. the portfolio is immutable — like a good container.</D>) },
  vim: { desc: "", hidden: true, run: (_, { print }) => print(<D>you'd never get out. type exit instead.</D>) },
  coffee: { desc: "", hidden: true, run: (_, { print }) => print(<A>☕ brewing… done. productivity +12%</A>) },
  hire: { desc: "", hidden: true, run: (_, ctx) => go("contact", ctx) },
};

// handy aliases
const alias = (name: string, target: string) => (commands[name] = { ...commands[target], hidden: true });
alias("emacs", "vim");
alias("nano", "vim");
alias("projects", "ls");
alias("goto", "cd");
alias("man", "help");

export function complete(input: string): string {
  const parts = input.replace(/^\s+/, "").split(/\s+/);
  if (parts.length <= 1) {
    const hits = Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(parts[0] ?? ""));
    return hits.length === 1 ? `${hits[0]} ` : input;
  }
  const cmd = commands[parts[0]];
  const opts = cmd?.complete?.() ?? [];
  const last = parts[parts.length - 1];
  const hits = opts.filter((o) => o.startsWith(last));
  if (hits.length !== 1) return input;
  return [...parts.slice(0, -1), hits[0]].join(" ") + " ";
}

/** Matching candidates, printed when Tab is ambiguous. */
export function candidates(input: string): string[] {
  const parts = input.replace(/^\s+/, "").split(/\s+/);
  if (parts.length <= 1) return Object.keys(commands).filter((c) => !commands[c].hidden && c.startsWith(parts[0] ?? ""));
  const opts = commands[parts[0]]?.complete?.() ?? [];
  return opts.filter((o) => o.startsWith(parts[parts.length - 1]));
}
