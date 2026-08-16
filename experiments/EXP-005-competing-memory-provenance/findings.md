# EXP-005 Findings

## Evidence run

GitHub Actions: Engram CI run `31923329226`.

Result: **PASS**.

The full repository check completed successfully, including `tests/runtime/competing-memory-provenance.test.ts`.

## Findings

1. Distinct recalls in the same execution preserve distinct retrieval IDs.
2. A decision may reference memory A only through a retrieval that actually exposed memory A.
3. Pairing memory A with retrieval B fails closed with `RETRIEVAL_MISMATCH` even when both memories were legitimately recalled elsewhere in the same execution.
4. The runtime does not silently repair or substitute provenance references.
5. The rejected influence attempt remains observable through an `INFLUENCE_REJECTED` runtime evaluation event.
6. A rejected provenance claim does not persist the invalid decision in the adversarial test store.

## Interpretation

The runtime enforces exact memory-to-action provenance rather than execution-level membership. “This memory was recalled somewhere during the run” is insufficient evidence that a specific retrieval exposed it to the decision being recorded.

This matters when an execution performs multiple recalls, retries, tools, or decision stages: retrieval identity remains part of the influence edge.

## Evidence boundary

This result is deterministic runtime/test evidence. It does not by itself prove credentialed CockroachDB reconstruction under live cloud conditions. The database integration suite separately exercises multi-recall trace reconstruction when `DATABASE_URL` is available.
