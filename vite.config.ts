import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `base: "./"` keeps asset URLs relative, so the build works on GitHub Pages
// (user or project site), Vercel, Netlify or any static host without changes.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
  },
});
