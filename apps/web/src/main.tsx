import React from "react";
import { createRoot } from "react-dom/client";

function isProofRoute() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  return normalizedPath === "/proof" || window.location.hash === "#proof";
}

async function renderApp() {
  const root = createRoot(document.getElementById("root")!);

  if (isProofRoute()) {
    const { ProofApp } = await import("./proof");
    root.render(
      <React.StrictMode>
        <ProofApp />
      </React.StrictMode>,
    );
    return;
  }

  const { Landing } = await import("./landing");
  root.render(
    <React.StrictMode>
      <Landing />
    </React.StrictMode>,
  );
}

void renderApp();
