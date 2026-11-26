import { Fragment } from "react";

/** Renders `*words*` in the serif italic accent face, everything else as-is. */
export default function Rich({ text, accent = true }: { text: string; accent?: boolean }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className={`serif text-[1.08em] font-normal tracking-normal ${accent ? "text-accent" : ""}`}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
