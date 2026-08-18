import React from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./landing";
import { ProofApp } from "./proof";
import "./styles.css";

function isProofRoute() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  return normalizedPath === "/proof" || window.location.hash === "#proof";
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isProofRoute() ? <ProofApp /> : <Landing />}
  </React.StrictMode>,
);
