# EXP-005 — Decision

Date: 2026-08-16
Status: ACCEPTED
Evidence run: GitHub Actions Engram CI `31935125047`

## Decision

Deployment recovery is accepted as a canonical Engram execution-memory acceptance scenario.

It validates the following cross-domain property:

`failure + recovery -> operational memory -> comparable recall -> changed application action -> observed outcome difference`

The scenario is useful because it exercises the full runtime lifecycle outside the original financial/venue demo:

1. source execution begins without relevant memory;
2. failure and recovery are observed;
3. recovery experience is admitted as operational memory;
4. a same-context memory-free control is executed;
5. a treatment execution recalls the source memory;
6. the application changes strategy;
7. Engram records exact retrieval/influence/counterfactual provenance;
8. the treatment outcome is observed.

## Architectural consequence

Stronger Engram scenarios should continue to use **real control executions** where practical. `CHANGED_ACTION` should not rely on an invented baseline when a controlled replay/shadow execution can supply stronger evidence.

Scenario-specific strategy logic remains outside Engram runtime core. Engram owns memory lifecycle, eligibility, evidence and provenance; the workload/application owns the operational decision.
