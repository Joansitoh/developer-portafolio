export const accents = {
  phosphor: { hex: "#b6ff3b", rgb: "182 255 59", ink: "#0b0d05" },
  amber: { hex: "#ffb000", rgb: "255 176 0", ink: "#140d00" },
  cyan: { hex: "#4de3ff", rgb: "77 227 255", ink: "#00141a" },
  magenta: { hex: "#ff4fd8", rgb: "255 79 216", ink: "#1a0015" },
  ice: { hex: "#e6edf3", rgb: "230 237 243", ink: "#0b0d10" },
} as const;

export type AccentName = keyof typeof accents;

export const isAccent = (v: string): v is AccentName => v in accents;

export function applyAccent(name: AccentName) {
  const a = accents[name];
  const root = document.documentElement.style;
  root.setProperty("--accent", a.hex);
  root.setProperty("--accent-rgb", a.rgb);
  root.setProperty("--accent-ink", a.ink);
  window.dispatchEvent(new CustomEvent("accentchange", { detail: name }));
}

/** Accent as normalized [r, g, b] — handy for WebGL uniforms. */
export function accentVec(name: AccentName): [number, number, number] {
  const [r, g, b] = accents[name].rgb.split(" ").map(Number);
  return [r / 255, g / 255, b / 255];
}
