import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./styles/index.css";
import "./lib/gsap";
import "./lib/store";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// A little something for whoever opens the console.
console.log(
  "%c joan.sh %c hey, fellow dev — press ` on the page for a real shell. source: github.com/Joansitoh/developer-portafolio",
  "background:#b6ff3b;color:#0b0d05;font-weight:700;padding:2px 6px",
  "color:#8b9099",
);
