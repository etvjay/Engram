import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  base: process.env.GITHUB_PAGES === "true" ? "/Engram/" : "/",
  plugins: [react()],
  build: {
    outDir: "../../dist-web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: new URL("./index.html", import.meta.url).pathname,
        proof: new URL("./proof/index.html", import.meta.url).pathname,
      },
    },
  },
});
