# Engram Experiment Registry

Experiment IDs are unique repository-wide. Before creating a new experiment directory, claim the next unused ID here. Do not create a second directory with an existing `EXP-###` prefix.

| ID | Canonical experiment | Primary question |
|---|---|---|
| EXP-001 | `EXP-001-memory-caused-decision` | Can persisted execution memory materially change a later comparable action? |
| EXP-002 | `EXP-002-bad-memory` | Can stale/ineligible memory be retrieved yet prevented from unsafe exposure or influence? |
| EXP-003 | `EXP-003-contradiction-and-harm` | Can contradiction and harmful-effect evidence remain append-only without latest-result-wins semantics? |
| EXP-004 | `EXP-004-competing-eligible-memories` | Can competing explicit memories remain visible while optional eligibility rules fail closed on unresolved contradiction? |
| EXP-005 | `EXP-005-competing-memory-provenance` | Does a later influence reference the exact retrieval that exposed the memory? |
| EXP-006 | `EXP-006-deployment-recovery` | Does failure/recovery memory change a later comparable software-deployment strategy under a real control execution? |
| EXP-007 | `EXP-007-coding-regression` | Does prior reverted coding regression change a later comparable coding strategy without overgeneralizing across contexts? |
| EXP-008 | `EXP-008-incident-recovery` | Does Engram preserve harmful recovery consequences and change a later comparable incident-recovery sequence? |

## Evidence discipline

Every experiment should contain `hypothesis.md`, `setup.md`, `findings.md`, and `decision.md` once accepted. Findings and decision must not be written as accepted before the relevant automated or external evidence has actually passed.

Scenario/application logic remains outside Engram runtime semantics. Prefer a concrete memory-free control execution when claiming `CHANGED_ACTION`; use inferred counterfactuals only when a real control, shadow run, or replay is not available and label the weaker evidence explicitly.

Experiment execution may be SIMULATED while memory/runtime/storage evidence is classified independently. Never promote a live-cloud or production-integration claim from deterministic scenario CI alone.
