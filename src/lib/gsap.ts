import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, useGSAP);

// House eases: a snappy "terminal" out-curve and a heavier in-out for big moves.
CustomEase.create("term", "0.16, 1, 0.3, 1");
CustomEase.create("slam", "0.7, 0, 0.2, 1");

gsap.defaults({ ease: "term", duration: 0.9 });

/** Glyph pool used by every scramble in the site. */
export const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFX$%&";

export { gsap, ScrollTrigger, SplitText, useGSAP };
