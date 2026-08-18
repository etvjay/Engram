import React, { useState } from "react";
import "./styles.css";

const GITHUB = "https://github.com/etvjay/Engram";
const DOCS = "https://github.com/etvjay/Engram/blob/main/docs/architecture.md";

const pipeline = ["Execution", "Trace", "Memory", "Influence", "Outcome"];

const lifecycle = [
  { name: "Capture", copy: "Consequential execution evidence is recorded." },
  { name: "Index", copy: "Experience is structured for later retrieval." },
  { name: "Recall", copy: "Relevant prior experience is retrieved." },
  { name: "Influence", copy: "The system records when memory changes a decision." },
  { name: "Compose", copy: "Later behavior can diverge from the prior path." },
];

const traits = [
  ["Persistence", "Across runtimes"],
  ["Recall", "Context-bound"],
  ["Influence", "Explicit"],
  ["Isolation", "Per agent"],
];

const pillars = [
  { title: "Durable by design", copy: "Execution history, provenance, and influence remain reconstructable." },
  { title: "Isolated by agent", copy: "Recall is scoped so foreign memory cannot become action authority." },
  { title: "Composable memory", copy: "One runtime surface across SDK, HTTP, MCP, and adapters." },
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
          <a className="quiet" href={GITHUB}>GitHub</a>
          <a className="pill" href="/proof">Watch an agent remember</a>
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
              Engram preserves consequential execution history, recalls relevant prior experience,
              and records when that experience changes what an agent does next.
            </p>
            <div className="row">
              <a className="pill" href="/proof">Watch an agent remember</a>
              <a className="ghost" href={GITHUB}>Build with Engram</a>
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
              <h2>Every run leaves a trace.<br />Relevant experience can change what happens next.</h2>
              <p>
                Engram turns consequential execution evidence into operational memory, retrieves it
                under comparable conditions, and keeps recall separate from proven influence.
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
              <article className="card causal-card">
                <header>
                  <span>Run comparison</span>
                  <strong>Something that happened before changed what the agent did next.</strong>
                </header>
                <div className="causal-mini">
                  <div className="causal-run">
                    <small>RUN A · NO PRIOR EXPERIENCE</small>
                    <b>Route C</b>
                    <i>↓</i>
                    <strong>LIQUIDITY FAILURE</strong>
                    <em>COMPENSATED</em>
                  </div>
                  <div className="causal-memory">
                    <span>OPERATIONAL MEMORY</span>
                    <b>Venue C failed under thin liquidity.</b>
                    <i>influenced →</i>
                  </div>
                  <div className="causal-run informed">
                    <small>RUN B · MEMORY RECALLED</small>
                    <b>Route D</b>
                    <i>↓</i>
                    <strong>EXECUTION SUCCEEDED</strong>
                    <em>CHANGED_ACTION</em>
                  </div>
                </div>
              </article>
              <article className="card">
                <header>
                  <span>Execution trace</span>
                  <strong>From raw steps to recalled experience.</strong>
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
              Persist intent, decisions, outcomes, and their provenance so later runtimes can
              recover relevant experience without inheriting a hidden session state.
            </p>
            <a className="pill" href={GITHUB}>Build with Engram</a>
          </div>
          <figure className="bust">
            <img src="/brand/bust.jpg" alt="A classical marble head, broken at the neck." />
          </figure>
          <aside className="id-right">
            <p className="kicker gold">Engram systems</p>
            <h3>Memory is infrastructure.</h3>
            <p>Durable execution context for agents, systems, and long-running workflows.</p>
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
            <p>Eligible memory is ranked and filtered against the context in which it may be used.</p>
            <div className="radar" aria-hidden="true" />
            <dl>
              <div><dt>Semantic relevance</dt><dd>Stage 1</dd></div>
              <div><dt>Validity</dt><dd>Checked</dd></div>
              <div><dt>Environment</dt><dd>Checked</dd></div>
              <div><dt>Source outcome</dt><dd>Checked</dd></div>
            </dl>
          </article>
          <article>
            <p className="kicker gold">Influence path</p>
            <h3>Recall is not influence</h3>
            <p>Engram records when a retrieved memory materially changes the later decision.</p>
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
            <h3>Evidence you can inspect</h3>
            <p>Operational memory stays linked to the execution evidence from which it was derived.</p>
            <ol className="prov">
              <li><b>1</b> Capture intent, action, context</li>
              <li><b>2</b> Persist source execution and outcome</li>
              <li><b>3</b> Record retrieval and memory references</li>
              <li><b>4</b> Reconstruct why later behavior changed</li>
            </ol>
          </article>
          <article>
            <p className="kicker gold">Application authority</p>
            <h3>Memory informs. Applications decide.</h3>
            <p>Engram records influence while the application remains responsible for the action.</p>
            <pre>{`POST /v1/executions/{id}/decisions
influences: [{
  type: "CHANGED_ACTION",
  retrievalId, memoryId
}]`}</pre>
          </article>
        </section>

        <section className="pillars">
          <h2>Infrastructure for experience that survives the runtime that created it.</h2>
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
          <p className="kicker gold">Proof</p>
          <h2>Watch prior execution experience change a fresh runtime's next decision.</h2>
          <div className="row">
            <a className="pill invert" href="/proof">Run the causal proof</a>
            <a className="ghost light" href={GITHUB}>Build with Engram</a>
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
