import { useEffect } from "react";
import BootSequence from "./components/BootSequence";
import Cursor from "./components/Cursor";
import StatusBar from "./components/StatusBar";
import Terminal from "./components/terminal/Terminal";
import { ScrollTrigger } from "./lib/gsap";
import { startSmoothScroll } from "./lib/smooth";
import { useReducedMotion } from "./hooks/useReducedMotion";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Stack from "./sections/Stack";
import Log from "./sections/Log";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

export default function App() {
  const reduced = useReducedMotion();

  useEffect(() => startSmoothScroll(reduced), [reduced]);

  // Web fonts change line breaks; re-measure every trigger once they're in.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <BootSequence />
      <main>
        <Hero />
        <About />
        <Projects />
        <Stack />
        <Log />
        <Contact />
      </main>
      <Footer />
      <StatusBar />
      <Terminal />
      <Cursor />
      <div className="crt-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
    </>
  );
}
