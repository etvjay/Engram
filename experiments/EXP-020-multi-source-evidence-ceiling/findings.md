# EXP-020 — Findings

**Status: PENDING — NOT ACCEPTED**

## Red evidence

The pre-implementation adversarial run reproduced the predicted authority escalation.

- Engram CI run: `31948342358`
- Adversarial commit: `5a1dfacce1b59f5a116c45c4962607ca9627de17`
- Result: **FAILURE**, as expected for the red phase.
- The mixed-source test supplied an `OBSERVED` historical supporting execution and a `VERIFIED` admitting execution, requested a `VERIFIED` memory, and the runtime admitted that memory.

This confirms EXP-017's admitting-execution ceiling did not cover additional declared supporting executions.

The same run also failed repository evidence-registry conformance because EXP-020 had been claimed before this required file existed. That is a bookkeeping failure, not evidence for or against the runtime hypothesis. This file is being added in pending state to satisfy the repository's complete-record invariant without prematurely accepting the experiment.

## Acceptance evidence

Not yet recorded. EXP-020 remains pending until the implementation, positive controls, fail-closed control and full CI pass.
