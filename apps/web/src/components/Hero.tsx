import React from "react";

export function Hero() {
  return (
    <section className="hero" id="overview">
      <div className="hero-copy">
        <p className="eyebrow">Persistent execution memory for autonomous agents</p>
        <h1>Memory for what agents do.</h1>
        <p className="hero-lede">Past executions should not disappear when an agent runtime does. Engram preserves what happened, reconstructs the experience when it becomes relevant again, and records whether that experience changed what happened next.</p>
        <div className="hero-actions"><a href="#trace">Follow the trace</a><a className="secondary" href="#evidence">Inspect evidence</a></div>
      </div>
      <div className="trajectory-hero" aria-label="Execution memory trajectory">
        <div className="runtime-label top">RUNTIME A</div>
        <div className="track track-a">
          <span>state</span><i /><span>state</span><i /><span>state</span><i /><span className="failure">failure</span>
        </div>
        <div className="memory-drop"><span>EXPERIENCE</span><i /><strong>durable memory trace</strong></div>
        <div className="runtime-boundary"><span>runtime boundary</span></div>
        <div className="memory-rise"><i /><span>prior experience</span></div>
        <div className="runtime-label bottom">RUNTIME B</div>
        <div className="track track-b">
          <span>state</span><i /><span className="amber">recall</span><i /><span>decision</span><i /><span className="amber">altered action</span>
        </div>
      </div>
    </section>
  );
}
