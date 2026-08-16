# EXP-005 — Findings

Date: 2026-08-16
Evidence run: GitHub Actions Engram CI `31935125047`
Result: PASS

## Findings

### 1. Execution memory changed a non-financial operational strategy

Run A had no relevant prior execution memory. The application selected `DIRECT_MIGRATION`, encountered `MIGRATION_LOCK_TIMEOUT`, rolled back successfully, and Engram admitted the resulting recovery lesson as operational memory.

A later same-context treatment execution recalled that memory and the application selected `EXPAND_CONTRACT` instead.

This demonstrates that the Engram runtime is not coupled to the original multi-venue Route C/Route D workload.

### 2. The behavioral difference has an observed control

The counterfactual was not fabricated. A separate same-context control execution ran with recall deliberately excluded, selected `DIRECT_MIGRATION`, and reproduced the compensated migration-lock failure.

The treatment decision therefore records:

- influence type: `CHANGED_ACTION`
- influential memory: the admitted Run A recovery memory
- retrieval: the exact treatment recall that exposed the memory
- counterfactual source: `CONTROL_RUN`
- comparison execution: the concrete control execution ID

### 3. Recovery experience survived as reusable operational memory

The source execution preserved both the failure and the successful recovery. The admitted memory summarized that `MIGRATION_LOCK_TIMEOUT` under the comparable high-write condition was recovered by rollback and that `EXPAND_CONTRACT` should be preferred for the same constrained workload.

The treatment retrieval surfaced that memory under the comparable workflow/environment/tool context.

### 4. The later outcome differed after memory influence

Control outcome: `COMPENSATED`.

Treatment outcome: `SUCCESS`.

The treatment trace records `CHANGED_ACTION` and an `INFLUENCE_ACCEPTED` evaluation event before the successful outcome.

## Evidence boundaries

- The deployment executor is deterministic experiment logic, not a live production deployment.
- Engram did not choose either deployment strategy; the application-side scenario decision function did.
- The experiment proves a controlled behavioral difference in this scenario, not universal superiority of expand/contract deployments.
- Live CockroachDB, Bedrock, and AWS deployment guarantees remain separate evidence claims.
