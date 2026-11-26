import type { Lang } from "../content/profile";

/**
 * A deliberately tiny tokenizer: comments, strings, numbers, keywords,
 * function calls and types. Good enough for short, curated snippets,
 * and ~50 lines instead of a 200 KB highlighter.
 */
const KEYWORDS: Record<Lang, string> = {
  js: "const let var for of in if else return new class this await async function import export from null true false",
  ts: "const let var for of in if else return new class this await async function import export from null true false type interface",
  rust: "pub const struct impl fn for use mod let mut self dyn match if else return true false",
  bash: "set for in do done case esac if then fi echo local function mkdir rm cp exit",
  java: "public private class void new return if else static final",
  python: "def class return import from if else for in None True False",
  kotlin: "fun val var class return if else",
  qml: "import property id function if else",
  conf: "if and then not contains",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STRING = String.raw`("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|` + "`(?:[^`\\\\]|\\\\.)*`)";

export function highlight(code: string, lang: Lang): string {
  const kw = KEYWORDS[lang].split(" ").join("|");
  const hashComments = lang === "bash" || lang === "conf" || lang === "python";
  const comment = hashComments ? String.raw`(#(?!\[)[^\n]*)` : String.raw`(\/\/[^\n]*)`;
  const re = new RegExp(
    [
      comment, // 1 comment
      STRING, // 2 string
      String.raw`(\b\d+(?:\.\d+)?\b)`, // 3 number
      `(\\b(?:${kw})\\b)`, // 4 keyword
      String.raw`(\b[a-zA-Z_]\w*(?=\s*\())`, // 5 call
      String.raw`(\b[A-Z]\w*\b|#\[[^\]]*\]|\$\{?\w+\}?)`, // 6 type / attribute / shell var
    ].join("|"),
    "g",
  );
  let out = "";
  let last = 0;
  for (const m of code.matchAll(re)) {
    const index = m.index ?? 0;
    out += esc(code.slice(last, index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "n" : m[4] ? "k" : m[5] ? "f" : "t";
    out += `<span class="tok-${cls}">${esc(m[0])}</span>`;
    last = index + m[0].length;
  }
  return out + esc(code.slice(last));
}
