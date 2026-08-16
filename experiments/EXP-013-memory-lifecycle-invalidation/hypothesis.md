# EXP-013 — Hypothesis

Date: 2026-08-16

## Question
Can Engram preserve obsolete operational memory as historical evidence while preventing it from retaining action authority after environment/tool evolution or explicit supersession?

## Hypothesis
A memory that was once valid should remain inspectable, but recall/influence eligibility should fail closed when current execution context invalidates it or when explicit relationship evidence marks it superseded. A newer compatible memory may remain eligible and influence a later action.

## Expected proof
`once-useful memory → environment/tool drift or explicit SUPERSEDES → obsolete memory rejected with reconstructable reason → current memory exposed → later decision may reference current memory → obsolete history remains inspectable`

## Invariants
- invalidation changes eligibility, not history;
- environment/tool invalidation is independent of relationship supersession;
- supersession must be explicit evidence, never inferred from vector similarity;
- rejected memories must retain machine-readable reasons;
- only exposed memory may influence a decision;
- Engram does not choose the workload action.