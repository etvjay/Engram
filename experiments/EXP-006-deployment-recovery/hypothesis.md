# EXP-006 — Deployment Recovery Memory

## Hypothesis

A prior software-deployment failure should change a later comparable deployment only when the retained operational memory is both semantically relevant and operationally applicable.

A prior execution that observed migration lock contention while a hot-table schema migration ran in parallel with release rollout should cause a later comparable deployment to choose `MIGRATE_THEN_DEPLOY` instead of the memory-free baseline `PARALLEL_MIGRATE_AND_DEPLOY`.

## Control

Same deployment context, memory disabled:

- application selects `PARALLEL_MIGRATE_AND_DEPLOY`;
- migration lock contention occurs;
- release is rolled back;
- outcome is `COMPENSATED`;
- customer impact is elevated errors.

## Treatment

Same deployment context, prior operational memory available:

- memory describes the prior lock-contention failure and rollback;
- application selects `MIGRATE_THEN_DEPLOY`;
- decision records the memory reference and memory-free counterfactual;
- deployment succeeds without customer impact.

## Negative control

A semantically similar memory with `migrationTouchesHotTable: false` must not change the current hot-table deployment strategy, even at a very high retrieval score.

## Falsification

The hypothesis fails if:

- treatment chooses the same unsafe strategy as control;
- irrelevant memory changes the action;
- the changed decision lacks an explicit memory reference;
- the treatment cannot state the memory-free counterfactual strategy.

## Evidence boundary

The workload simulator is deterministic and SIMULATED. The experiment tests scenario generality of Engram's execution-memory proposition; it does not claim a live deployment system integration.
