import React from "react";
import { createRoot } from "react-dom/client";

const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
const base = (env.BASE_URL ?? "/").replace(/\/$/, "");
const isProofRoute = window.location.pathname === `${base}/proof` || window.location.hash === "#proof";
const root = createRoot(document.getElementById("root")!);

if (isProofRoute) {
  void import("./app/App").then(({ App }) => {
    root.render(<React.StrictMode><App /></React.StrictMode>);
  });
} else {
  void import("./landing").then(({ Landing }) => {
    root.render(<React.StrictMode><Landing /></React.StrictMode>);
  });
}
