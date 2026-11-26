/**
 * Everything the portfolio says lives in this file.
 * Edit it and the whole site (sections, terminal commands, status bar…) follows.
 */

export type Lang =
  | "rust"
  | "js"
  | "ts"
  | "bash"
  | "java"
  | "python"
  | "kotlin"
  | "qml"
  | "conf";

export interface Project {
  /** Folder-style id, used by the terminal (`open decibel-limiter`). */
  slug: string;
  name: string;
  tagline: string;
  description: string;
  year: number;
  stack: string[];
  repo?: string;
  live?: string;
  /** A real excerpt from the repo, shown in the card's editor pane. */
  snippet: { file: string; lang: Lang; code: string };
}

export interface ArchiveEntry {
  slug: string;
  name: string;
  year: number;
  lang: string;
  description: string;
  url: string;
}

export interface LogEntry {
  date: string;
  branch: "main" | "minecraft" | "sysadmin" | "web" | "systems";
  type: "init" | "feat" | "chore" | "release" | "refactor";
  scope?: string;
  message: string;
  body: string;
  tags?: string[];
}

const GH = "https://github.com/Joansitoh";

export const profile = {
  name: "Joan",
  handle: "joansiitoh",
  location: "Barcelona, ES",
  timezone: "Europe/Madrid",
  since: 2018,
  available: true,
  availability: "open to new projects",
  roles: [
    "full-stack developer",
    "systems tinkerer",
    "linux sysadmin",
    "browser-extension builder",
    "rust + wasm modder",
  ],
  /** Short pitch under the hero name. Words wrapped in *asterisks* render in serif italic. */
  pitch:
    "I write software that *actually runs* — from Minecraft servers and Linux boxes to Rust, WebAssembly and the browser.",
  about: [
    "I started in 2018 writing Java plugins for Minecraft servers — the kind of place where a bad loop costs you two hundred players at once. That taught me to care about performance before I knew the word for it.",
    "Since then I've run Linux servers, written the SSH monitors and firewall GUIs I needed for them, shipped React and Electron tools, a browser extension on the Chrome Web Store, a full KDE Plasma theme and, lately, Rust code compiled to WebAssembly.",
    "I like small, sharp tools, interfaces that feel instant, and automating anything I have to do twice.",
  ],
  email: "dev@joancabrera.es",
  socials: [
    { label: "github", handle: "@Joansitoh", url: GH },
    { label: "linkedin", handle: "in/joansiitoh", url: "https://www.linkedin.com/in/joansiitoh" },
    { label: "x", handle: "@joansiitohtv", url: "https://twitter.com/joansiitohtv" },
  ],
  neofetch: [
    ["host", "barcelona, es"],
    ["uptime", ""], // computed from `since`
    ["shell", "zsh / bash / pwsh"],
    ["editor", "vscode + claude code"],
    ["langs", "ts · js · rust · java · python · kotlin"],
    ["web", "react · vue · tailwind · node"],
    ["infra", "linux · nginx · docker · redis"],
    ["status", "shipping"],
  ] as [string, string][],
} as const;

export const projects: Project[] = [
  {
    slug: "decibel-limiter",
    name: "Decibel Limiter",
    tagline: "A lookahead limiter for your browser",
    description:
      "Browser extension that stops loud audio peaks before you hear them. It delays audio ~10 ms on the audio thread, sees the spike coming and has already ducked when it plays. Published on the Chrome Web Store.",
    year: 2026,
    stack: ["AudioWorklet", "WebExtensions", "JavaScript", "Playwright"],
    repo: `${GH}/decibel-limiter`,
    live: "https://chromewebstore.google.com/detail/decibel-limiter/jhdflfacjalpcajleapijmclnbilnjlh",
    snippet: {
      file: "extension/js/limiter-processor.js",
      lang: "js",
      code: `// The gain applied to whichever block we emit must already account for
// every louder block still waiting in the lookahead window.
let requiredGain = 1;
for (const item of this.pending)
  if (item.targetGain < requiredGain) requiredGain = item.targetGain;

const currentDB = 20 * Math.log10(this.activeGain);
const requiredDB = 20 * Math.log10(requiredGain);
this.activeGain = requiredDB < currentDB
  ? requiredGain // ATTACK: never overshoot
  : Math.pow(10, Math.min(requiredDB, currentDB + releaseDbPerBlock) / 20);

if (this.pending.length <= this.lookaheadBlocks) return null;`,
    },
  },
  {
    slug: "replay-studio",
    name: "Replay Studio",
    tagline: "Replay editor as a sandboxed wasm mod",
    description:
      "Record, browse and edit Horizon replays — a Minecraft: Java Edition rewrite in Rust. The editor ships as a sandboxed WebAssembly mod that drives playback through the mod API.",
    year: 2026,
    stack: ["Rust", "WebAssembly", "Horizon mod API", "CI"],
    repo: `${GH}/replay-studio`,
    snippet: {
      file: "src/lib.rs",
      lang: "rust",
      code: `pub const ID: &str = "replay_studio";
pub const KEY_OPEN: &str = "open";
pub const DEFAULT_KEY_OPEN: &str = "key.keyboard.f8";

#[derive(Default)]
struct ReplayStudio;

#[mod_api::horizon_mod]
impl Hooks for ReplayStudio {
    fn register(&self, r: &mut dyn Registrar, _: &RegistrationContext) {
        r.register_key_mapping(
            KeyRegistration::new(KEY_OPEN, DEFAULT_KEY_OPEN)
                .label("key.replay_studio.open")
                .context(KeyConflictContext::InGame),
        );
    }
}`,
    },
  },
  {
    slug: "glasspane-theme",
    name: "Glasspane",
    tagline: "Windows 11 vibes on KDE Plasma 6",
    description:
      "A dark, glassy global theme for KDE Plasma 6 with its own start menu widget, centred taskbar, Windows-style tray and clock — while staying a normal Plasma session.",
    year: 2026,
    stack: ["QML", "KDE Plasma 6", "Kvantum", "Bash", "Python"],
    repo: `${GH}/glasspane-theme`,
    snippet: {
      file: "install.sh",
      lang: "bash",
      code: `set -euo pipefail
DATA="\${XDG_DATA_HOME:-$HOME/.local/share}"
CONF="\${XDG_CONFIG_HOME:-$HOME/.config}"
LAYOUT="Glasspane"; APPLY=1; TB_OPACITY=""
for a in "$@"; do case "$a" in
  --layout=left)   LAYOUT="Glasspane-Left" ;;
  --no-apply)      APPLY=0 ;;
  --titlebar-opacity=*) TB_OPACITY="\${a#*=}" ;;
  *) echo "unknown option: $a" >&2; exit 1 ;;
esac; done

put() { mkdir -p "$2"; rm -rf "$2/$(basename "$1")"; cp -a "$1" "$2/"; }
echo "• Installing components…"`,
    },
  },
  {
    slug: "ssh-monitor",
    name: "Netvisr SSH Monitor",
    tagline: "Who is knocking on port 22?",
    description:
      "Dashboard to watch SSH and sudo activity on Linux machines: rsyslog rules feed a Node API, a cron 'police' job bans offenders, and a React UI maps attempts by country.",
    year: 2024,
    stack: ["React", "Node", "rsyslog", "cron", "Linux"],
    repo: `${GH}/ssh_monitor`,
    live: "https://monitor.netvisr.me/",
    snippet: {
      file: "server/syslog.js",
      lang: "conf",
      code: `# Netvisr logs format for SSH and Sudo activities

# Failed SSH login attempts due to invalid user
if $programname == 'sshd' and $msg contains 'Invalid user'
  then /var/log/netvisr/ssh_failed.log;sshInvalidUserFormat

# Successful SSH logins using public key
if $programname == 'sshd' and $msg contains 'Accepted publickey'
  then /var/log/netvisr/ssh_accepted.log;sshKeyAuthFormat

# Sudo password failures
if $programname == 'sudo' and $msg contains 'authentication failure'
  then /var/log/netvisr/sudo_failed.log;sudoFailFormat`,
    },
  },
  {
    slug: "korbo-jump",
    name: "Korbo Jump",
    tagline: "Realtime multiplayer, lava rising",
    description:
      "Last-one-standing multiplayer game in the browser: procedural platforms, rising lava and air bursts to push rivals. Built as an experiment in AI-generated game development.",
    year: 2025,
    stack: ["Three.js", "Socket.IO", "Node", "Express"],
    repo: `${GH}/korbi-jump`,
    live: "https://korbo-jump.vercel.app",
    snippet: {
      file: "server.js",
      lang: "js",
      code: `socket.on('startGame', () => {
  const roomId = socket.data.roomId;
  if (!roomId || !rooms[roomId]) return;

  const playerCount = Object.keys(rooms[roomId].players).length;
  if (playerCount < 2) return socket.emit('error', { message: 'Need 2 players' });

  rooms[roomId].gameStarted = true;
  rooms[roomId].lavaHeight = -10;
  rooms[roomId].platforms = generateGamePlatforms();

  io.to(roomId).emit('gameStarted', { ...rooms[roomId] });
  startLavaRise(roomId);
});`,
    },
  },
];

export const archive: ArchiveEntry[] = [
  { slug: "cv-forge", name: "cv-forge", year: 2025, lang: "React", description: "Build and export a professional CV to A4 PDF, in the browser.", url: "https://cv-forge-ashen.vercel.app" },
  { slug: "bit-clicker", name: "bit-clicker", year: 2024, lang: "Electron", description: "Modern, minimal auto clicker for Windows.", url: `${GH}/bit-clicker` },
  { slug: "multi-browser-checker", name: "multi-browser-checker", year: 2024, lang: "JS", description: "One view, many devices: preview a site across viewports.", url: `${GH}/multi-browser-checker` },
  { slug: "lively-neon-sign", name: "lively-neon-sign", year: 2024, lang: "JS", description: "Customizable neon sign wallpaper for Lively Wallpaper.", url: "https://lively-neon-sign.vercel.app" },
  { slug: "battery-alerts", name: "battery-alerts", year: 2024, lang: "Shell", description: "Tiny battery level notifications for Linux.", url: `${GH}/battery-alerts` },
  { slug: "edge-profile-manager", name: "edge-profile-manager", year: 2023, lang: "Python", description: "Jump between Microsoft Edge profiles from a friendly UI.", url: `${GH}/edge-profile-manager` },
  { slug: "ufw-manager-gui", name: "ufw_manager_gui", year: 2023, lang: "Python", description: "Manage UFW firewall ports on a remote box over SSH.", url: `${GH}/ufw_manager_gui` },
  { slug: "slibs-api", name: "minecraft-slibs-api", year: 2021, lang: "Java", description: "Shared library for a team's Spigot plugins: events, config, chat, Discord.", url: `${GH}/minecraft-slibs-api` },
  { slug: "lunarparty", name: "minecraft-lunarparty-plugin", year: 2021, lang: "Java", description: "Parties on top of Lunar Client's TeamView mod.", url: `${GH}/minecraft-lunarparty-plugin` },
  { slug: "bungeestaffs", name: "minecraft-bungeestaffs-plugin", year: 2021, lang: "Java", description: "Staff tooling for BungeeCord networks with a rich chat formatter.", url: `${GH}/minecraft-bungeestaffs-plugin` },
];

export const stack: { dir: string; note: string; items: string[] }[] = [
  { dir: "languages", note: "daily drivers first", items: ["TypeScript", "JavaScript", "Rust", "Java", "Python", "Kotlin", "PHP", "Lua", "Bash", "QML"] },
  { dir: "frontend", note: "interfaces that feel instant", items: ["React", "Vue", "Tailwind", "GSAP", "Three.js", "Electron"] },
  { dir: "backend", note: "boring, reliable, fast", items: ["Node", "Express", "Socket.IO", "PostgreSQL", "MySQL", "MongoDB", "Redis"] },
  { dir: "infra", note: "where it actually runs", items: ["Linux", "Nginx", "Apache", "Docker", "UFW", "rsyslog", "GitHub Actions"] },
  { dir: "platforms", note: "odd places I ship to", items: ["WebAssembly", "WebExtensions", "KDE Plasma", "Android", "Spigot / NMS", "BungeeCord"] },
  { dir: "ai", note: "agents doing the boring part", items: ["Claude Code", "LLM agents", "Playwright automation"] },
];

export const log: LogEntry[] = [
  {
    date: "2026",
    branch: "systems",
    type: "release",
    scope: "systems",
    message: "rust, wasm and the desktop",
    body: "Replay Studio as a sandboxed WebAssembly mod, Decibel Limiter on the Chrome Web Store and the Glasspane theme for KDE Plasma 6.",
    tags: ["HEAD -> main", "v2.0"],
  },
  {
    date: "2025",
    branch: "web",
    type: "feat",
    scope: "ai",
    message: "agents join the team",
    body: "Korbo Jump, a realtime multiplayer game built through AI-driven development, CV Forge and automation pipelines with LLM agents.",
  },
  {
    date: "2024",
    branch: "web",
    type: "feat",
    scope: "web",
    message: "react, electron, dashboards",
    body: "Netvisr SSH Monitor, BitClicker on Electron, the first version of this portfolio and a pile of small tools.",
    tags: ["v1.0"],
  },
  {
    date: "2023",
    branch: "sysadmin",
    type: "feat",
    scope: "linux",
    message: "own the servers too",
    body: "Running Linux boxes with Nginx and Apache — and writing the firewall and profile managers I needed along the way.",
  },
  {
    date: "2021",
    branch: "minecraft",
    type: "feat",
    scope: "minecraft",
    message: "plugins for real networks",
    body: "Spigot & BungeeCord plugins and a shared library for a development team: parties, staff tools, grappling hooks.",
  },
  {
    date: "2018",
    branch: "main",
    type: "init",
    message: "hello, world",
    body: "First commits. Java, a Minecraft server and a lot of stack traces.",
  },
];

/** Window list for the status bar / navigation. Order = page order. */
export const sections = [
  { id: "home", label: "home", cmd: "whoami" },
  { id: "about", label: "about", cmd: "cat about.md" },
  { id: "work", label: "work", cmd: "ls ~/projects" },
  { id: "stack", label: "stack", cmd: "tree ~/stack" },
  { id: "log", label: "log", cmd: "git log --graph" },
  { id: "contact", label: "contact", cmd: "ssh hello@joan" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
