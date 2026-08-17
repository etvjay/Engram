import React, { useState } from "react";

const GITHUB = "https://github.com/etvjay/Engram";
const DOCS = "https://github.com/etvjay/Engram/blob/main/docs/architecture.md";

export function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="lp">
      <a className="skip" href="#main">Skip to content</a>

      <header className="nav">
        <a className="wordmark" href="/" aria-label="Engram home">
          <span className="mark" aria-hidden="true" />
          Engram
        </a>
        <button
          className="menu"
          type="button"
          aria-expanded={navOpen}
          aria-controls="nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          Menu
        </button>
        <nav id="nav" className={navOpen ? "is-open" : ""}>
          <a href="#product">Product</a>
          <a href="#protocol">Protocol</a>
          <a href="/proof">Proof</a>
          <a href={DOCS}>Docs</a>
        </nav>
        <a className="cta" href={GITHUB}>Build with Engram</a>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">Execution-memory infrastructure</p>
            <h1>Memory for what agents do.</h1>
            <p className="lede">
              Engram persists intent, decisions, and outcomes so later runs
              execute with context, not amnesia. The application still decides.
            </p>
            <div className="actions">
              <a className="cta" href={GITHUB}>Build with Engram</a>
              <a className="text-link" href="/proof">Read the proof</a>
            </div>
            <ul className="traits">
              <li><i /> Recall</li>
              <li><i /> Consistency</li>
              <li><i /> Provenance</li>
              <li><i /> Isolation</li>
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="/brand/hero-cream.jpg" alt="" />
          </div>
        </section>

        <section className="product" id="product">
          <div className="product-intro">
            <p className="kicker light">Built for agentic systems</p>
            <h2>Every run leaves a trace.<br />Every future run is informed.</h2>
            <p>
              Capture execution. Index it. Recall only what is eligible.
              Record influence only when the application cites it.
            </p>
          </div>

          <div className="instruments">
            <article className="panel">
              <header>
                <span>Run comparison</span>
                <b>Control vs treatment</b>
              </header>
              <p>A memory-free baseline stays visible beside the influenced run.</p>
              <div className="bars" aria-hidden="true">
                {[
                  ["Task success", 46, 88],
                  ["Policy adherence", 52, 91],
                  ["Step consistency", 38, 84],
                  ["Outcome stability", 41, 86],
                ].map(([label, a, b]) => (
                  <div className="bar-row" key={String(label)}>
                    <span>{label}</span>
                    <div>
                      <i style={{ width: `${a}%` }} />
                      <em style={{ width: `${b}%` }} />
                    </div>
                  </div>
                ))}
                <div className="legend">
                  <span><i /> Without Engram</span>
                  <span><em /> With recalled memory</span>
                </div>
              </div>
            </article>

            <article className="panel">
              <header>
                <span>Execution trace</span>
                <b>From raw steps to recalled memory</b>
              </header>
              <ol className="trace">
                <li><code>00</code> Intent received</li>
                <li><code>04</code> Policy check</li>
                <li className="hit"><code>11</code> Memory recalled · retrieval <i>r-8f2</i></li>
                <li className="hit"><code>12</code> Decision cites memory · <i>CHANGED_ACTION</i></li>
                <li><code>18</code> Outcome recorded</li>
              </ol>
            </article>

            <article className="panel">
              <header>
                <span>Influence path</span>
                <b>Every trace leaves a fork</b>
              </header>
              <svg className="path" viewBox="0 0 360 140" role="img" aria-label="Baseline path versus memory-influenced path">
                <path d="M16 108 C 90 108, 130 108, 180 72 S 280 28, 344 24" fill="none" stroke="#3a3428" strokeWidth="1.2" />
                <path d="M16 108 C 90 108, 140 108, 188 88 S 270 70, 344 68" fill="none" stroke="#c4a15a" strokeWidth="1.6" />
                <circle cx="16" cy="108" r="3.2" fill="#f4efe6" />
                <circle cx="188" cy="88" r="4.4" fill="#c4a15a" />
                <circle cx="344" cy="68" r="3.2" fill="#f4efe6" />
                <text x="10" y="128" fill="#8a8376" fontSize="9">START</text>
                <text x="168" y="78" fill="#c4a15a" fontSize="9">MEMORY</text>
                <text x="312" y="86" fill="#8a8376" fontSize="9">OUTCOME</text>
              </svg>
            </article>

            <article className="panel">
              <header>
                <span>Provenance</span>
                <b>Attested, versioned, verifiable</b>
              </header>
              <div className="stack" aria-hidden="true">
                <div><b>1 Capture</b><span>Intent, action, context</span></div>
                <div><b>2 Attest</b><span>Exact retrieval + state digest</span></div>
                <div><b>3 Store</b><span>Immutable execution record</span></div>
                <div><b>4 Verify</b><span>Reconstruct anytime</span></div>
              </div>
            </article>
          </div>
        </section>

        <section className="protocol" id="protocol">
          <div className="protocol-copy">
            <p className="kicker">Protocol</p>
            <h2>Retrieval is not influence.</h2>
            <p>
              A memory can be found and still never touch a decision. Influence
              requires the exact recall, the state that was shown, and a sourced
              counterfactual when the action changes.
            </p>
          </div>
          <ol className="steps">
            <li><span>01</span><strong>Admit</strong> from evidence, never from a summary blob.</li>
            <li><span>02</span><strong>Expose</strong> only after policy, ownership, and lineage pass.</li>
            <li><span>03</span><strong>Cite</strong> the retrieval that actually showed the memory.</li>
            <li><span>04</span><strong>Keep</strong> the baseline. The application still chooses.</li>
          </ol>
        </section>

        <section className="close">
          <p className="kicker light">Start</p>
          <h2>Give agents memory they can be held to.</h2>
          <p>Engram will remember what happened. It will not decide what happens next.</p>
          <div className="actions">
            <a className="cta invert" href={GITHUB}>Open the repository</a>
            <a className="text-link light" href="/proof">Run the causal proof</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <a className="wordmark" href="/"><span className="mark" aria-hidden="true" />Engram</a>
        <p>Execution memory. MIT. External workloads in the demo are simulated.</p>
        <nav>
          <a href={GITHUB}>GitHub</a>
          <a href={DOCS}>Architecture</a>
          <a href="/proof">Proof</a>
        </nav>
      </footer>
    </div>
  );
}
