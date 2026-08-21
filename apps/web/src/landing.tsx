import React, { useEffect, useMemo, useState } from "react";
import { evidenceClient } from "./lib/evidence-client";
import { findAblationExperiment } from "./lib/ablation";
import type { AblationStage, EvidenceIndex, EvidenceSyncState } from "./types/evidence";

const CANONICAL_GITHUB = "https://github.com/etvjay/Engram-Memory";
const BASE = (import.meta as ImportMeta & { env: Record<string, string> }).env.BASE_URL ?? "/";
const PROOF = `${BASE}proof`;
const asset = (name: string) => `${BASE}brand/${name}`;

const pipeline = ["Execution", "Outcome", "Experience", "Recall", "Influence"];
const lifecycle = [
  { name: "Capture", copy: "Record execution and outcome." },
  { name: "Persist", copy: "Keep experience across runtime death." },
  { name: "Recall", copy: "Reconstruct relevant prior experience." },
  { name: "Influence", copy: "Record how memory entered a decision." },
  { name: "Provenance", copy: "Preserve the path back to evidence." },
];

const pillars = [
  { title: "Durable by design", copy: "Execution history, outcomes, recall and provenance survive the runtime that produced them." },
  { title: "Decision authority stays outside", copy: "Engram remembers and records influence. The application or agent still decides." },
  { title: "Composable memory", copy: "The same Engram semantics can sit beneath different agent and application interfaces." },
  { title: "Evidence before claims", copy: "Mechanism, provenance and causal status stay visible instead of being collapsed into one success story." },
];

const integrations = [
  { id: "SDK", title: "Embed execution memory directly.", copy: "TypeScript and Python surfaces for execution lifecycle, recall, outcomes and provenance." },
  { id: "REST API", title: "Connect any runtime.", copy: "A framework-neutral HTTP interface for systems that should not depend on an Engram SDK." },
  { id: "MCP", title: "Give agents native memory tools.", copy: "Agent-facing capabilities over Engram semantics for execution history, memory recall, artifacts, branches and provenance." },
  { id: "ADAPTERS", title: "Carry continuity across frameworks.", copy: "A compatibility layer for agent runtimes and orchestration frameworks so the runtime can change without resetting execution history." },
];

const roadmap = [
  ["CONTROL PLANE", "Inspect memories, executions, policies and provenance."],
  ["EVENT STREAMS", "Subscribe to execution and memory-state changes."],
  ["WEBHOOKS", "Push relevant lifecycle events into application workflows."],
  ["MEMORY POLICY", "Admission, expiry, invalidation, supersession and influence rules."],
  ["MULTI-AGENT WORKSPACES", "Shared durable execution history without requiring identical runtimes."],
  ["BRANCH / COUNTERFACTUAL ANALYSIS", "Compare execution paths and inspect where remembered experience may have contributed to divergence."],
] as const;

const mcpTools = ["execution.read", "execution.append", "memory.recall", "artifact.attach", "branch.compare", "provenance.inspect"];

function statusClass(status: string) {
  return status === "TESTED" ? "proof-tested" : status === "NOT_RUN" ? "proof-not-run" : "proof-unknown";
}

export function Landing() {
  const [open, setOpen] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceIndex | null>(null);
  const [sync, setSync] = useState<EvidenceSyncState>("LOADING");

  useEffect(() => {
    let active = true;
    evidenceClient.loadIndex().then((index) => {
      if (!active) return;
      setEvidence(index);
      setSync("SYNCED");
    }).catch(() => {
      if (!active) return;
      setSync("UNAVAILABLE");
    });
    return () => { active = false; };
  }, []);

  const stages = useMemo(() => {
    const labels: Array<[AblationStage, string]> = [
      ["A0", "No memory"],
      ["A1", "Flat local memory"],
      ["A2", "Hydra state"],
      ["A3", "Hydra graph"],
      ["A4", "Behavioral causal"],
    ];
    return labels.map(([id, label]) => ({ id, label, status: findAblationExperiment(evidence, id)?.status ?? "UNAVAILABLE" }));
  }, [evidence]);

  const prism14 = evidence?.experiments?.find((experiment) => experiment.id === "PRISM-14");
  const a2 = findAblationExperiment(evidence, "A2");
  const a3 = findAblationExperiment(evidence, "A3");

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>

      <header className="top">
        <a className="logo" href={BASE}><i />Engram</a>
        <button className="burger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Menu</button>
        <nav className={open ? "on" : ""}>
          <a href="#product">Product</a>
          <a href="#system">System</a>
          <a href="#integrate">Integrate</a>
          <a href={PROOF}>Proof</a>
          <a href={CANONICAL_GITHUB}>GitHub</a>
        </nav>
        <div className="top-end">
          <a className="quiet" href={PROOF}>Inspect proof</a>
          <a className="pill" href={CANONICAL_GITHUB}>View source</a>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <img className="hero-field" src={asset("hands-field.jpg")} alt="A stone hand dissolving into a field meets a topographic hand at one point of light." />
          <ol className="slices" aria-hidden="true">
            <li className="void" />
            {pipeline.map((step) => <li key={step}><span>{step}</span></li>)}
          </ol>
          <div className="hero-copy">
            <p className="kicker">Persistent execution memory</p>
            <h1>Memory<br />for what<br />agents do.</h1>
            <p className="lede">Engram preserves what happened during execution, reconstructs relevant prior experience across runtimes, and records whether that experience entered a later decision.</p>
            <div className="row">
              <a className="pill" href={CANONICAL_GITHUB}>View canonical source</a>
              <a className="ghost" href={PROOF}>Inspect the evidence</a>
            </div>
            <ul className="traits semantic-traits">
              <li><span>Records</span><b>Execution</b></li>
              <li><span>Preserves</span><b>Outcome</b></li>
              <li><span>Reconstructs</span><b>Experience</b></li>
              <li><span>Separates</span><b>Recall / influence</b></li>
            </ul>
          </div>
          <ol className="compose">
            {lifecycle.map((item) => <li key={item.name}><b>{item.name}</b><span>{item.copy}</span></li>)}
          </ol>
        </section>

        <section className="work" id="product">
          <div className="work-head">
            <div>
              <p className="kicker gold">What Engram preserves</p>
              <h2>Every run leaves a trace.<br />Relevant experience can return.</h2>
              <p>Engram treats execution topology as the durable artifact: what happened, what followed, what became experience, what was later recalled, and whether influence was explicitly recorded.</p>
              <ul className="life">
                {lifecycle.map((item) => <li key={item.name}><b>{item.name}</b><span>{item.copy}</span></li>)}
              </ul>
            </div>
            <div className="pair">
              <article className="card mechanism-card">
                <header><span>A2 / A3 mechanism</span><strong>Graph context expands retrieval without inventing outcome gains.</strong></header>
                <div className="mechanism-compare" aria-label="A2 Hydra state compared with A3 Hydra graph">
                  <div><small>A2</small><b>HYDRA STATE</b><em className={statusClass(a2?.status ?? "UNAVAILABLE")}>{a2?.status ?? "UNAVAILABLE"}</em><span>selected state</span></div>
                  <i aria-hidden="true">NEXT_STATE</i>
                  <div><small>A3</small><b>HYDRA GRAPH</b><em className={statusClass(a3?.status ?? "UNAVAILABLE")}>{a3?.status ?? "UNAVAILABLE"}</em><span>selected state + radius-1 context</span></div>
                </div>
              </article>
              <article className="card trace-card">
                <header><span>Execution-memory sequence</span><strong>Recall is an event. Influence is a separate claim.</strong></header>
                <ol className="log semantic-log">
                  <li><code>EXEC</code> Execution captured</li>
                  <li><code>OUT</code> Outcome persisted</li>
                  <li><code>EXP</code> Experience reconstructed</li>
                  <li className="ok"><code>REC</code> Recall enters context <b>Recalled</b></li>
                  <li><code>INF</code> Influence recorded separately</li>
                </ol>
                <div className="recall-invariant"><span>CRITICAL INVARIANT</span><strong>RECALL ≠ INFLUENCE</strong></div>
              </article>
            </div>
          </div>
        </section>

        <section className="identity" id="system">
          <div className="id-left">
            <p className="word">Engram</p>
            <p className="kicker">System boundary</p>
            <h2>Memory survives the runtime. Authority does not move with it.</h2>
            <p>Engram stores execution, outcome, memory, recall, influence and provenance semantics above HydraDB. The application or agent retains decision authority.</p>
            <a className="pill" href={PROOF}>Inspect provenance</a>
          </div>
          <figure className="bust"><img src={asset("bust.jpg")} alt="A classical marble head, broken at the neck." /></figure>
          <aside className="id-right">
            <p className="kicker gold">Architecture</p>
            <h3>Engram is the semantic layer.</h3>
            <p>HydraDB is the persistent graph-memory substrate. SDK, REST, MCP and adapters are interfaces into Engram—not separate memory databases.</p>
            <div className="layers architecture-layers">
              <div className="slab s1" /><div className="slab s2" /><div className="slab s3" />
              <ul><li>Agent / application</li><li>Engram semantics</li><li>HydraDB substrate</li></ul>
            </div>
          </aside>
        </section>

        <section className="instruments" id="instruments">
          <article>
            <p className="kicker gold">Recall</p><h3>Recover prior experience without collapsing it into authority.</h3>
            <p>Relevant execution evidence can re-enter context. Whether that evidence affected a later decision remains separately classified.</p>
            <div className="radar semantic-radar" aria-hidden="true" />
            <dl className="semantic-dl"><div><dt>Execution</dt><dd>recorded</dd></div><div><dt>Outcome</dt><dd>preserved</dd></div><div><dt>Recall</dt><dd>separate event</dd></div><div><dt>Influence</dt><dd>explicit state</dd></div></dl>
          </article>
          <article>
            <p className="kicker gold">Influence path</p><h3>Memory may shape a path. It does not own the decision.</h3>
            <p>The application or agent remains the action authority. Engram records the evidence and the declared influence relationship.</p>
            <svg viewBox="0 0 360 150" className="fork" aria-label="Illustrative influence path">
              <path d="M18 118 C 100 118, 140 118, 190 78 S 290 30, 342 26" fill="none" stroke="#3a3428" strokeWidth="1.25" />
              <path d="M18 118 C 100 118, 148 118, 196 92 S 280 74, 342 72" fill="none" stroke="#c4a15a" strokeWidth="1.7" />
              <circle cx="18" cy="118" r="3.4" fill="#f3eee4" /><circle cx="196" cy="92" r="5" fill="#c4a15a" /><circle cx="342" cy="72" r="3.4" fill="#f3eee4" />
              <text x="12" y="138" fill="#8a8376" fontSize="10">EXECUTION</text><text x="166" y="80" fill="#c4a15a" fontSize="10">MEMORY</text><text x="300" y="92" fill="#8a8376" fontSize="10">ACTION</text>
            </svg>
            <div className="recall-invariant compact"><strong>RECALL ≠ INFLUENCE</strong></div>
          </article>
          <article>
            <p className="kicker gold">Structural provenance</p><h3>Trace recall into a later decision point.</h3>
            <p>PRISM-14 tests structural causal provenance. It does not establish a memory-OFF versus memory-ON behavioral effect.</p>
            <ol className="prov"><li><b>1</b> Prior execution</li><li><b>2</b> Persisted experience</li><li><b>3</b> Later recall</li><li><b>4</b> Influence classification</li><li><b>5</b> Later action / outcome provenance</li></ol>
            <div className={`instrument-status ${statusClass(prism14?.status ?? "UNAVAILABLE")}`}>PRISM-14 · {prism14?.status ?? "UNAVAILABLE"} · STRUCTURAL ONLY</div>
          </article>
          <article>
            <p className="kicker gold">Decision authority</p><h3>Engram remembers. The application decides.</h3>
            <p>Influence states describe the relationship between recalled experience and a decision. A4 behavioral causality remains separate.</p>
            <pre>{`influence_state =
  CONSIDERED |
  SUPPORTED_ACTION |
  CONSTRAINED_ACTION |
  CHANGED_ACTION

A4 behavioral proof: NOT_RUN`}</pre>
          </article>
        </section>

        <section className="proof-snapshot" id="proof-snapshot">
          <div className="proof-intro">
            <p className="kicker gold">Proof snapshot</p>
            <h2>The claim boundary stays visible.</h2>
            <p>High-level status comes directly from the canonical Engram-Memory evidence index. Deeper benchmark, mechanism, provenance and warning detail lives on the proof surface.</p>
            <div className="proof-provenance"><span>{sync}</span><span>{evidence?.ref ?? "UNAVAILABLE"}</span><span>{evidence?.commit?.slice(0, 12) ?? "UNAVAILABLE"}</span></div>
            <a className="ghost light" href={PROOF}>Inspect the evidence</a>
          </div>
          <div className="proof-stage-list">
            {stages.map((stage) => <div key={stage.id}><span>{stage.id}</span><b>{stage.label}</b><em className={statusClass(stage.status)}>{stage.status}</em></div>)}
            <div className="structural-row"><span>PRISM-14</span><b>Structural provenance</b><em className={statusClass(prism14?.status ?? "UNAVAILABLE")}>{prism14?.status ?? "UNAVAILABLE"}</em></div>
            <div className="proof-invariant"><span>INVARIANT</span><strong>RECALL ≠ INFLUENCE</strong></div>
          </div>
        </section>

        <section className="integrate" id="integrate">
          <div className="integrate-head">
            <p className="kicker gold">Integration surfaces / direction</p>
            <h2>Memory should survive the runtime.</h2>
            <p>Engram is designed as a durable execution-memory layer beneath agents, models and applications. Integrate once, then carry operational experience across runtimes.</p>
          </div>
          <div className="integration-bus" aria-label="Future Engram integration surfaces">
            <div className="surface-rail">
              {integrations.map((item) => <article key={item.id}><span>{item.id}</span><h3>{item.title}</h3><p>{item.copy}</p>{item.id === "MCP" && <div className="mcp-tools">{mcpTools.map((tool) => <code key={tool}>{tool}</code>)}</div>}</article>)}
            </div>
            <div className="bus-line"><span>Agent / Runtime</span><i /><strong>ENGRAM</strong><i /><span>HydraDB</span></div>
            <p className="bus-note">SDK / REST / MCP / ADAPTERS enter Engram semantics. MCP is an agent-native usability surface over Engram; HydraDB remains the persistent graph-memory substrate.</p>
          </div>
        </section>

        <section className="roadmap-band" aria-label="Future Engram surfaces">
          <div className="roadmap-label"><p className="kicker">Where Engram goes next</p><strong>Future-facing surfaces</strong><span>Direction, not deployment status.</span></div>
          <div className="roadmap-grid">{roadmap.map(([name, copy]) => <article key={name}><span>{name}</span><p>{copy}</p></article>)}</div>
        </section>

        <section className="pillars">
          <h2>Infrastructure for memory that scales with ambition.</h2>
          <div>{pillars.map((pillar) => <article key={pillar.title}><h3>{pillar.title}</h3><p>{pillar.copy}</p></article>)}</div>
        </section>

        <section className="end">
          <p className="kicker gold">Build from evidence</p>
          <h2>Give agents execution history that survives them.</h2>
          <div className="row"><a className="pill invert" href={CANONICAL_GITHUB}>View canonical repository</a><a className="ghost light" href={PROOF}>Inspect the proof</a></div>
        </section>
      </main>

      <footer className="base">
        <a className="logo" href={BASE}><i />Engram</a>
        <p>Persistent execution memory. Recall and influence remain distinct.</p>
        <nav><a href={CANONICAL_GITHUB}>GitHub</a><a href={PROOF}>Proof</a><a href="#integrate">Integrate</a></nav>
      </footer>
    </div>
  );
}
