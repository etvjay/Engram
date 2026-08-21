import React from "react";
import { createRoot } from "react-dom/client";

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
const base = (env.BASE_URL ?? "/").replace(/\/$/, "");
const pathname = window.location.pathname.replace(/\/$/, "");
const isProofRoute = pathname === `${base}/proof` || window.location.hash === "#proof";
const root = createRoot(document.getElementById("root")!);

if (isProofRoute) {
  void Promise.all([
    import("./proof-evidence.css"),
    import("./proof-extensions.css"),
    import("./research.css"),
    import("./app/App"),
  ]).then(([, , , { App }]) => {
    root.render(<React.StrictMode><App /></React.StrictMode>);
  });
} else {
  void Promise.all([
    import("./landing.css"),
    import("./landing-extensions.css"),
    import("./landing"),
  ]).then(([, , { Landing }]) => {
    root.render(<React.StrictMode><Landing /></React.StrictMode>);
  });
}
