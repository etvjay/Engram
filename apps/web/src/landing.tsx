import React, { useState } from "react";

const GITHUB = "https://github.com/etvjay/Engram";
const DOCS = "https://github.com/etvjay/Engram/blob/main/docs/architecture.md";

const pipeline = ["Execution", "Trace", "Memory", "Influence", "Outcome"];

const lifecycle = [
  { name: "Capture", copy: "Every action is recorded." },
  { name: "Index", copy: "Meaning is structured." },
  { name: "Recall", copy: "Context is retrieved." },
  { name: "Influence", copy: "Decisions are informed." },
  { name: "Compose", copy: "New paths emerge." },
];

const traits = [
  ["Recall", "Instant"],
  ["Consistency", "Always"],
  ["Nameability", "Essential"],
  ["Scale", "Boundless"],
];

const bars = [
  ["Task success", 42, 86],
  ["Policy adherence", 48, 90],
  ["Step consistency", 36, 82],
  ["Outcome stability", 40, 84],
];

const pillars = [
  { title: "Durable by design", copy: "Execution history, provenance, and influence stay reconstructable." },
  { title: "Isolated by agent", copy: "Recall is scoped. Foreign memory cannot become action authority." },
  { title: "Composable memory", copy: "One runtime through SDK, HTTP, MCP, and adapters." },
  { title: "Developer first", copy: "Contracts, traces, and fail-closed policy — not a prompt bag." },
];

export function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>

      <header className="top">
        <a className="logo" href="/"><i />Engram</a>
        <button className="burger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>Menu</button>
        <nav className={open ? "on" : ""}>
          <a href="#product">Product</a>
          <a href="#system">System</a>
          <a href="/proof">Proof</a>
          <a href={DOCS}>Docs</a>
        </nav>
        <div className="top-end">
          <a className="quiet" href="/proof">See proof</a>
          <a className="pill" href={GITHUB}>Build with Engram</a>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <img
            className="hero-field"
            src="/brand/hands-field.jpg"
            alt="A stone hand dissolving into dust meets a gold topographic hand at one point of light."
          />
          <ol className="slices" aria-hidden="true">
            <li className="void" />
            {pipeline.map((step) => (
              <li key={step}><span>{step}</span></li>
            ))}
          </ol>
          <div className="hero-copy">
            <p className="kicker">Execution-memory infrastructure</p>
            <h1>Memory<br />for what<br />agents do.</h1>
            <p className="lede">
              Engram is the execution-memory layer for agents and systems. We persist
              intent, decisions, and outcomes — so future runs execute with context,
              not amnesia.
            </p>
            <div className="row">
              <a className="pill" href={GITHUB}>Build with Engram</a>
              <a className="ghost" href="/proof">Read the proof</a>
            </div>
            <ul className="traits">
              {traits.map(([k, v]) => (
                <li key={k}><span>{k}</span><b>{v}</b></li>
              ))}
            </ul>
          </div>
          <ol className="compose">
            {lifecycle.map((item) => (
              <li key={item.name}><b>{item.name}</b><span>{item.copy}</span></li>
            ))}
          </ol>
        </section>

        <section className="work" id="product">
          <div className="work-head">
            <div>
              <p className="kicker gold">Built for agentic systems</p>
              <h2>Every run leaves a trace.<br />Every future run is informed.</h2>
              <p>
                Engram captures execution context at every step and makes a
                reliably admissible set available to influence what happens next.
              </p>
              <ul className="life">
                {lifecycle.map((item) => (
                  <li key={item.name}>
                    <b>{item.name}</b>
                    <span>{item.copy}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pair">
              <article className="card">
                <header>
                  <span>Run comparison</span>
                  <strong>Informed runs are more consistent.</strong>
                </header>
                <div className="chart">
                  {bars.map(([label, a, b]) => (
                    <div key={String(label)} className="col">
                      <div className="col-bars">
                        <i style={{ height: `${a}%` }} />
                        <em style={{ height: `${b}%` }} />
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="key"><i /> Without Engram <em /> With Engram</div>
              </article>
              <article className="card">
                <header>
                  <span>Execution trace</span>
                  <strong>From raw steps to recalled memory.</strong>
                </header>
                <ol className="log">
                  <li><code>00:01</code> Intent received</li>
                  <li><code>00:04</code> Policy check</li>
                  <li className="ok"><code>00:11</code> Recall admitted <b>Recalled</b></li>
                  <li className="ok"><code>00:12</code> Decision cites memory <b>Influenced</b></li>
                  <li><code>00:18</code> Outcome recorded</li>
                </ol>
              </article>
            </div>
          </div>
        </section>

        <section className="identity" id="system">
          <div className="id-left">
            <p className="word">Engram</p>
            <p className="kicker">Execution-memory infrastructure</p>
            <h2>Built for what systems must remember.</h2>
            <p>
              We persist intent, decisions, and outcomes — so systems can carry
              context across time, agents, and environments.
            </p>
            <a className="pill" href={GITHUB}>Build with Engram</a>
          </div>
          <figure className="bust">
            <img src="/brand/bust.jpg" alt="A classical marble head, broken at the neck." />
          </figure>
          <aside className="id-right">
            <p className="kicker gold">Engram systems</p>
            <h3>Memory is infrastructure.</h3>
            <p>Durable execution context for agents, systems, and workflows.</p>
            <div className="layers">
              <div className="slab s1" />
              <div className="slab s2" />
              <div className="slab s3" />
              <ul>
                <li>Application</li>
                <li>Runtime</li>
                <li>Evidence</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className="instruments" id="instruments">
          <article>
            <p className="kicker gold">Memory recall</p>
            <h3>Recall what matters</h3>
            <p>Eligible memory only. Ranked, filtered, and bound to the state that was shown.</p>
            <div className="radar" aria-hidden="true" />
            <dl>
              <div><dt>User intent</dt><dd>0.98</dd></div>
              <div><dt>Policy guidance</dt><dd>0.95</dd></div>
              <div><dt>Previous outcome</dt><dd>0.93</dd></div>
              <div><dt>Tool selection</dt><dd>0.89</dd></div>
            </dl>
          </article>
          <article>
            <p className="kicker gold">Influence path</p>
            <h3>Every trace leaves influence</h3>
            <p>Memory does not overwrite paths — it shapes what comes next.</p>
            <svg viewBox="0 0 360 150" className="fork">
              <path d="M18 118 C 100 118, 140 118, 190 78 S 290 30, 342 26" fill="none" stroke="#3a3428" strokeWidth="1.25" />
              <path d="M18 118 C 100 118, 148 118, 196 92 S 280 74, 342 72" fill="none" stroke="#c4a15a" strokeWidth="1.7" />
              <circle cx="18" cy="118" r="3.4" fill="#f3eee4" />
              <circle cx="196" cy="92" r="5" fill="#c4a15a" />
              <circle cx="342" cy="72" r="3.4" fill="#f3eee4" />
              <text x="12" y="138" fill="#8a8376" fontSize="10">START</text>
              <text x="172" y="80" fill="#c4a15a" fontSize="10">MEMORY</text>
              <text x="300" y="92" fill="#8a8376" fontSize="10">OUTCOME</text>
            </svg>
          </article>
          <article>
            <p className="kicker gold">Provenance</p>
            <h3>Provenance you can trust</h3>
            <p>Every memory is attested, versioned, and verifiable.</p>
            <ol className="prov">
              <li><b>1</b> Capture intent, action, context</li>
              <li><b>2</b> Attest retrieval and state digest</li>
              <li><b>3</b> Store an immutable record</li>
              <li><b>4</b> Verify anywhere, anytime</li>
            </ol>
          </article>
          <article>
            <p className="kicker gold">Application authority</p>
            <h3>Systems remember. Outcomes improve.</h3>
            <p>Engram records influence. The application still chooses the action.</p>
            <pre>{`POST /v1/executions/{id}/decisions
influences: [{
  type: "CHANGED_ACTION",
  retrievalId, memoryId
}]`}</pre>
          </article>
        </section>

        <section className="pillars">
          <h2>Infrastructure for memory that scales with ambition.</h2>
          <div>
            {pillars.map((p) => (
              <article key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="end">
          <p className="kicker gold">Start</p>
          <h2>Give agents memory they can be held to.</h2>
          <div className="row">
            <a className="pill invert" href={GITHUB}>Build with Engram</a>
            <a className="ghost light" href="/proof">Run the causal proof</a>
          </div>
        </section>
      </main>

      <footer className="base">
        <a className="logo" href="/"><i />Engram</a>
        <p>© Engram. MIT. Demo workloads are simulated; memory causality is inspectable.</p>
        <nav>
          <a href={GITHUB}>GitHub</a>
          <a href={DOCS}>Architecture</a>
          <a href="/proof">Proof</a>
        </nav>
      </footer>
    </div>
  );
}
