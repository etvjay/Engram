# EXP-019 Decision

**Status:** PENDING

Do not accept or promote a claim for EXP-019 until the complete Engram CI suite is green with recall-state binding preserved by every relevant runtime-store fixture and by the Cockroach persistence path.

The dedicated adversarial suite is necessary but not sufficient acceptance evidence.

## Acceptance conditions

- unchanged state can influence after persisted recall reconstruction;
- authority-relevant mutations behind the same memory ID fail closed;
- legacy/unbound recall records remain readable but cannot support a new influence claim;
- exact retrieval provenance from EXP-008 remains enforced;
- existing provenance, ownership, evidence, lifecycle and counterfactual guarantees continue to pass;
- all test stores preserve the state binding rather than depending on a warm runtime;
- full Engram CI passes before findings are changed to accepted.
