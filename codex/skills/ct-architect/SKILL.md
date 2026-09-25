---
name: ct-architect
description: Develop an evidence-backed solution and implementation plan for an architecture question or a feature with meaningful design alternatives.
---

# Architecture and implementation planning

Resolve the problem from the user's request, supplied issue/path, or active
conversation. Ask only for missing information that changes the design. Do not
select an unrelated recent plan merely because it exists on disk.

Explicit user instructions and higher-priority instructions take precedence.
Read applicable repository guidance. This is planning work unless implementation
or a disposable spike is also authorized. Continue authorized investigation
without repeatedly seeking approval for routine choices.

## Evidence and alternatives

1. Trace the existing system, integration boundaries, and reusable components.
   Separate observed facts, assumptions, and unknowns; cite files and lines.
2. Assess blast radius and reversibility. T0 is trivial, T1 is local/reversible,
   T2 crosses components, and T3 affects consequential state or security. Scale
   depth to actual risk; small changes need only a short plan.
3. Compare the viable approaches that materially differ. Include reuse or no
   build when appropriate. Consider user experience, operations, security,
   reliability, cost, and maintenance without inventing alternatives to fill a quota.
4. Use current authoritative external sources when needed for uncertain framework
   or provider behavior. Verify applicability to the actual code/version. If access
   is unavailable, identify the specific unverified assumption.
5. Recommend the simplest approach meeting the user's criteria. Explain the main
   tradeoff and why the strongest alternative loses. Surface consequential product
   choices; make routine implementation decisions with stated assumptions.

## Plan and completion

Produce scoped steps with affected files/interfaces, dependencies, observable
acceptance criteria, relevant tests, and rollout/rollback concerns where applicable.
For stateful operations address partial failure, retries, concurrency, and recovery;
for user flows address incomplete input, errors, and completion evidence.
Resolve load-bearing unknowns with a bounded, authorized spike when useful.

Finish with the recommendation, plan, and remaining decisions. Do not present
self-review as an independent critique. If the user requested the full workflow,
continue to plan checking and implementation within that scope; a planning-only
request ends with the plan. Store durable notes only where repository rules permit.

## Codex execution

Use the current session's tools and model; the supported target is `gpt-6-astra`.
No other skill is required. When delegation is explicitly authorized and supported,
give bounded independent questions to reviewers and inherit the selected model.
Otherwise assess the relevant perspectives sequentially; do not claim a panel ran.
