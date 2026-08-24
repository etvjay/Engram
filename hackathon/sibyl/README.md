# Engram × Sibyl — EBI Instance

Status: `READY_FOR_LIVE_PRESSURE` for the core memory path.

Submission status remains **not ready**. Partner work, evaluator-facing README fields, hackathon-window evidence, public demo/video/posts and final truth revalidation are still outstanding.

This directory is the Evaluated Build Instantiation (EBI) wrapper for adapting Engram to the Sibyl Labs Hackathon without changing Engram's canonical product semantics.

## Frozen candidate thesis

**Engram is execution-memory infrastructure: prior execution experience becomes bounded operational memory that can legitimately change later autonomous behavior.**

For this hackathon deployment, **Sibyl is the load-bearing persistence and recall substrate**. Engram retains the semantics for admission, eligibility, influence, provenance, invalidation, competing memory and counterfactual evaluation.

```text
execution event
  -> Engram episode/evidence semantics
  -> Sibyl persistence
  -> fresh-session Sibyl recall
  -> Engram eligibility/influence policy
  -> application decision
  -> changed action/result
  -> outcome/provenance
```

## Observed core proof — 2026-08-24
GitHub Actions run `32750511943`, job `97506098369`, executed the Sibyl profile on code head `df341ef` in a clean Ubuntu runner:

- installed `sibyl-memory-client==0.6.1`;
- built Engram successfully;
- passed 4/4 Sibyl pressure tests;
- rejected expired Sibyl memory before exposure;
- rejected influence after the persisted memory changed post-recall;
- process A persisted an execution-derived memory;
- a distinct process B recalled the same memory ID;
- no-memory control selected Route C;
- memory-conditioned execution selected Route D;
- recorded `CHANGED_ACTION` plus a counterfactual and memory-state digest;
- deletion mutation removed the configured Sibyl runtime and observed fail-closed degradation with no fallback.

This is `LOCAL_PASS` evidence generated before the official hackathon build window. It is not the final submission proof and must be declared as prior work where required.

## Non-negotiable deletion test

If Sibyl persistence/recall is removed, the submitted build must lose the decision-critical cross-session execution memory required to produce the claimed changed behavior.

A CockroachDB fallback that preserves equivalent decision-critical memory in the judged path is therefore **not allowed** for the hackathon profile.

## Current next gates
1. Revalidate official hackathon and SDK truth at the start of the Sep 1 build window.
2. Re-run the full pressure harness as hackathon-window evidence.
3. Add evaluator-facing root README call map + Prior Work declaration.
4. Decide and implement the strongest top-band scenario beyond route recovery; agent-provider experiential continuity remains preferred.
5. Add Base/Virtuals only if they are causally necessary and exercised, not decorative.
6. Build the continuous 2–5 minute evaluator proof and public evidence surfaces.

## EBI state machine

`READY_TO_RESEARCH -> READY_TO_BUILD -> READY_FOR_LIVE_PRESSURE -> READY_FOR_SUBMISSION -> SUBMISSION_FROZEN`

No optimistic promotion. Evidence state must justify every transition.
