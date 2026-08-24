# Engram × Sibyl — EBI Instance

Status: `READY_TO_RESEARCH`

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

## Non-negotiable deletion test

If Sibyl persistence/recall is removed, the submitted build must lose the decision-critical cross-session execution memory required to produce the claimed changed behavior.

A CockroachDB fallback that preserves equivalent decision-critical memory in the judged path is therefore **not allowed** for the hackathon profile.

## EBI state machine

`READY_TO_RESEARCH -> READY_TO_BUILD -> READY_FOR_LIVE_PRESSURE -> READY_FOR_SUBMISSION -> SUBMISSION_FROZEN`

No optimistic promotion. Evidence state must justify every transition.
