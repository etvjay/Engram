# EXP-020 — Decision

**Status: PENDING — NOT ACCEPTED**

No architectural decision is accepted yet.

The red phase has shown that current multi-source admission can elevate a memory above one of its declared supporting source outcomes. The candidate rule under test is that every declared `sourceExecutionId` is supporting evidence and therefore contributes a conservative evidence ceiling; the memory may not claim an evidence rank above the weakest declared supporting source outcome.

This file will be promoted to an accepted decision only after the implementation, adversarial regression, positive controls, fail-closed missing-outcome control and full Engram CI are green.
