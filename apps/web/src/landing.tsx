import React, { useState } from "react";

const GITHUB = "https://github.com/etvjay/Engram";
const DOCS = "https://github.com/etvjay/Engram/blob/main/docs/architecture.md";

const pipeline = [
  { id: "01", name: "Execution", copy: "Intent, context, and constraints are recorded as they happen." },
  { id: "02", name: "Trace", copy: "Observations stay linked to the run that produced them." },
  { id: "03", name: "Memory", copy: "Policy admits operational lessons from evidence, not summaries." },
  { id: "04", name: "Influence", copy: "A later decision may cite the exact recall that exposed a memory." },
  { id: "05", name: "Outcome", copy: "The action and result remain reconstructable against a baseline." },
];

const principles = [
  {
    kicker: "Not chat memory",
    title: "Memory for what systems have done.",
    body: "Engram preserves prior executions and derives operational memory from evidence. It is not a conversation store, a RAG wrapper, or a second brain for prompts.",
  },
  {
    kicker: "Recall is not influence",
    title: "Retrieval never proves a decision changed.",
    body: "A memory may be found, ranked, and still rejected before exposure. Influence requires the exact retrieval, the memory state that was shown, and a sourced counterfactual when the action changes.",
  },
  {
    kicker: "The application decides",
    title: "Engram does not choose the action.",
    body: "SDKs, HTTP, MCP, and adapters share one runtime. They record and validate memory influence. Business action selection stays with the agent or application.",
  },
];

const surfaces = [
  { name: "TypeScript SDK", detail: "Execution-scoped client over HTTP or in-process runtime." },
  { name: "Python SDK", detail: "Same lifecycle: start, recall, decide, observe, complete." },
  { name: "HTTP API", detail: "Fail-closed bearer guard on every non-demo /v1 route." },
  { name: "Engram MCP", detail: "Inspect execution, explain influence, compare runs." },
  { name: "Adapters", detail: "OpenAI Agents and LangGraph become Execution Episodes." },
  { name: "Control plane", detail: "Read-only views of agents, memories, policy, and evaluation." },
];

export function Landing() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="lp">
      <a className="skip" href="#main">Skip to content</a>

      <header className="lp-nav">
        <a className="mark" href="/" aria-label="Engram home">
          <span className="mark-glyph" aria-hidden="true" />
          <span>Engram</span>
        </a>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={navOpen}
          aria-controls="site-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          Menu
        </button>
        <nav id="site-nav" className={navOpen ? "open" : ""} aria-label="Primary">
          <a href="#system">System</a>
          <a href="#protocol">Protocol</a>
          <a href="#surfaces">Surfaces</a>
          <a href="/proof">Proof</a>
          <a href={DOCS}>Docs</a>
        </nav>
        <a className="btn btn-solid nav-cta" href={GITHUB}>Build with Engram</a>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Execution-memory infrastructure</p>
            <h1>Memory for what agents do.</h1>
            <p className="lede">
              Engram gives autonomous systems memory for prior executions, not just prior text.
              It recalls that experience under comparable conditions, governs whether it may
              influence action, and leaves enough provenance to reconstruct what changed.
            </p>
            <div className="hero-actions">
              <a className="btn btn-solid" href={GITHUB}>Build with Engram</a>
              <a className="btn btn-ghost" href="/proof">See the causal proof</a>
            </div>
            <ul className="hero-meta">
              <li>Instant recall</li>
              <li>Always reconstructable</li>
              <li>Application-owned decisions</li>
            </ul>
          </div>
          <figure className="hero-figure">
            <img
              src="/brand/hero.jpg"
              alt="A fractured marble cornice and column meet at a gold node that opens into a circuit field."
            />
            <figcaption>
              Execution becomes structure. Structure becomes a field that later runs can enter.
            </figcaption>
          </figure>
        </section>

        <ol className="pipeline" aria-label="Canonical lifecycle">
          {pipeline.map((step, index) => (
            <li key={step.id}>
              <span className="pipe-id">{step.id}</span>
              <strong>{step.name}</strong>
              <p>{step.copy}</p>
              {index < pipeline.length - 1 && <span className="pipe-rule" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <section className="split" id="system">
          <div>
            <p className="eyebrow">The governing invariant</p>
            <h2>A prior run must be able to change a later one — and you must be able to prove it.</h2>
          </div>
          <p className="split-lede">
            Completeness is not storage. Engram is complete only when a persisted execution is
            retrieved under comparable future context, explicitly influences a later decision,
            causes an observable change from the memory-free baseline, and leaves a reconstructable
            trace. Prompt inclusion is not causal proof.
          </p>
        </section>

        <section className="principles">
          {principles.map((item) => (
            <article key={item.kicker}>
              <p className="eyebrow">{item.kicker}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <section className="gallery">
          <figure>
            <img src="/brand/field.jpg" alt="A gold disc at the center of concentric instrument rings on black stone." />
            <figcaption>Recall is ranked, filtered, and bound to the state that was shown.</figcaption>
          </figure>
          <figure>
            <img src="/brand/strata.jpg" alt="Layered marble with gold foil sheets lifting from the upper strata." />
            <figcaption>History is stratified. Authority can expire without deleting the record.</figcaption>
          </figure>
        </section>

        <section className="dark" id="protocol">
          <div className="dark-head">
            <p className="eyebrow">Protocol</p>
            <h2>Every arrow stays inspectable.</h2>
            <p>
              One semantic runtime serves every surface. Policy is frozen onto the execution at start.
              Contradictory memories coexist. Usefulness is evaluated with explicit methods, not later success.
            </p>
          </div>
          <div className="protocol-grid">
            <article>
              <span className="num">01</span>
              <h3>Admit from evidence</h3>
              <p>
                Memories enter on signals such as unexpected failure, recovery, human correction,
                significant cost, or a repeated pattern. Derived memory cannot outrank the evidence
                that admitted it.
              </p>
            </article>
            <article>
              <span className="num">02</span>
              <h3>Expose under policy</h3>
              <p>
                Candidates start unexposed. Expiry, environment, score, agent ownership, and source
                lineage are applied before anything is shown to the agent.
              </p>
            </article>
            <article>
              <span className="num">03</span>
              <h3>Cite the exact recall</h3>
              <p>
                Influence must name the memory and the retrieval that exposed it. A valid memory
                paired with the wrong retrieval fails closed. If the memory state changed after
                exposure, influence is rejected.
              </p>
            </article>
            <article>
              <span className="num">04</span>
              <h3>Keep the counterfactual</h3>
              <p>
                <code>CHANGED_ACTION</code> requires a sourced baseline. Controlled runs are preferred
                over invented ones. The application still selects the action.
              </p>
            </article>
          </div>
        </section>

        <section className="surfaces" id="surfaces">
          <div className="dark-head">
            <p className="eyebrow">Surfaces</p>
            <h2>One runtime. Several ways in.</h2>
          </div>
          <ul>
            {surfaces.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="boundary" id="evidence">
          <p className="eyebrow">Evidence boundary</p>
          <h2>Claims stay no stronger than the proof.</h2>
          <div className="boundary-grid">
            <article>
              <h3>Tested</h3>
              <p>
                Protocol, runtime, SDKs, adapters, and twenty acceptance experiments run in CI.
                The causal spine is proven against a deterministic workload.
              </p>
            </article>
            <article>
              <h3>Simulated</h3>
              <p>
                The original multi-venue executor is simulated on purpose. Persistence, retrieval,
                influence validation, and traces are real repository operations.
              </p>
            </article>
            <article>
              <h3>Unverified until live</h3>
              <p>
                CockroachDB Cloud, embeddings, C-SPANN index selection, and public AWS deployment
                stay unverified until credentialed workflows emit artifacts. Missing proof remains
                UNKNOWN.
              </p>
            </article>
          </div>
        </section>

        <section className="close">
          <p className="eyebrow">Start</p>
          <h2>Give agents memory they can be held to.</h2>
          <p>
            Clone the repository, run the suite, then attach a runtime to an execution.
            Engram will remember what happened. It will not decide what happens next.
          </p>
          <div className="hero-actions">
            <a className="btn btn-solid" href={GITHUB}>Open the repository</a>
            <a className="btn btn-ghost" href="/proof">Run the proof</a>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <a className="mark" href="/">
          <span className="mark-glyph" aria-hidden="true" />
          <span>Engram</span>
        </a>
        <p>Execution memory for autonomous systems. MIT licensed.</p>
        <nav aria-label="Footer">
          <a href={GITHUB}>GitHub</a>
          <a href={DOCS}>Architecture</a>
          <a href="/proof">Proof</a>
        </nav>
      </footer>
    </div>
  );
}
