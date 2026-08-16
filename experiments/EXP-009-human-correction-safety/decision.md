# EXP-009 — Decision

Date: 2026-08-16
Status: **ACCEPTED at scenario/runtime level; aggregate repository rerun required after registry update**
Scenario evidence: GitHub Actions Engram CI `31935785267`

## Decision

Human correction is accepted as a first-class source of Engram Operational Memory.

A later autonomous action may be changed by an earlier human correction when the correction is explicitly observed, admitted with provenance, recalled under comparable scoped context, and referenced by the later decision.

## Accepted invariant

`human correction → operational memory → comparable recall → changed autonomous action`

The source execution may end `ABORTED` when the corrected action was never executed. Engram must not manufacture a failure/success outcome merely to create memory.

## Required causal form

1. autonomous system proposes an action;
2. human rejects/corrects it before execution;
3. correction is observed with human provenance and admitted as memory;
4. a real same-context memory-free control repeats the old proposal;
5. treatment recalls the correction and changes its proposal;
6. the influence edge cites the exact retrieval and real control execution;
7. correction scope is respected rather than generalized from retrieval score alone.

## Architectural consequence

Human correction remains evidence/input to Engram, not an Engram-generated policy decree. Scenario/application logic interprets the correction and owns the later action. Engram preserves the source, scope, recall, influence, and counterfactual provenance.

## Boundary

The maintenance scenario is **SIMULATED**. Live operator/infrastructure integration remains externally unverified. Full repository acceptance is confirmed only after the experiment registry is updated and aggregate CI passes.
