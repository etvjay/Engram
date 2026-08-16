# EXP-019 Findings

**Status:** IN PROGRESS — NOT ACCEPTED

## Initial evidence

The dedicated EXP-019 runtime suite passes all 9 current cases, including runtime reconstruction, unchanged-state acceptance, authority-relevant field mutation rejection, and legacy unbound-recall rejection.

Initial full Engram CI run `31947220066` is **not green** and therefore is not acceptance evidence.

The full suite exposed an expected conformance gap in historical in-memory scenario/test stores: those stores persisted `memoryId` and retrieval identity but discarded the new `memoryStateDigest` supplied in `RecallExposureUpdate`. Their positive influence tests consequently failed closed with `RECALL_MEMORY_STATE_UNBOUND`.

This is a useful failure, not a reason to weaken the invariant. Those stores must preserve the same recall-state binding as the production Cockroach runtime store before EXP-019 can be accepted.

The evidence-registry conformance test also correctly required this findings file and a decision file once EXP-019 was claimed in the canonical registry.

## Current conclusion

The new invariant behaves as intended in its dedicated adversarial suite, but repository-wide acceptance is pending migration of all test/store fixtures and a fully green CI run.
