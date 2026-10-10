---
name: ct-review-loop
description: Review a code change for concrete defects across quality dimensions, and verify fixes when review-and-fix is authorized.
---

# Evidence-based code review

Resolve the target diff, branch/base, or files from the request. Read surrounding
code, consumers, tests, and acceptance criteria before judging the change.
Explicit user instructions and higher-priority instructions take precedence.
Review-only requests produce findings; they do not authorize edits or publication.

## Coverage

Assess these eight dimensions, recording evidence and a verdict for each relevant
one. Use not-applicable with a reason; mark missing evidence unverified.

| Dimension | Look for |
|---|---|
| Correctness/stability | Broken invariants, transaction boundaries, return shapes, locale/time assumptions |
| Security/data | Authorization gaps, tenant leakage, injection, secrets, unsafe fields and retention |
| Performance/concurrency | N+1 queries, unbounded work, races, lock scope, capacity and cost |
| Edge cases | Empty/malformed/stale input, boundary values, partial outcomes and permission variants |
| Maintainability/API | Divergent duplicated logic, incompatible interfaces, unnecessary mechanisms |
| Testing | Assertions tied to observable behavior, meaningful failures, regression and fixture coverage |
| Resilience | Dependency failure, timeout, lost response, retry duplication, stuck state and recovery |
| Operability | Actionable errors, failure visibility, diagnosis and safe recovery |

For user-facing changes, examine the full journey: feedback, preserved work,
error recovery, keyboard/accessibility, responsive layout, localization, and safe
rendering. Use browser checks where needed and available; static reading is not a
live UX test. For migrations/configuration/deployment, inspect populated-data
behavior, idempotency, dependency provenance, version overlap and rollback order.

For UI changes, include an explicit visual-usability assessment of the rendered
screen with representative content: hierarchy, scanability, density, status
association and action prominence. A working handler or an overflow-free page
does not establish a usable layout. Ground findings in the user's task and visible
evidence, separating material friction from aesthetic preference. If a companion
experience review covers this, carry its findings and limits into the overall
verdict; otherwise assess it here. Mark unavailable visual evidence unverified.

## Challenge the implementation

Start from the user's task, the pre-change contract and the acceptance scenarios.
Do not restrict the review to the author's tests or preferred success path. For
stateful changes, construct relevant adversarial timelines across the real callers:
no request received, effect with lost acknowledgement, late success, concurrent
work, navigation and newer input. Assert what must NOT happen as well as what must.
Inspect reused handlers for dispatch, cancellation, global-state, navigation and
cleanup side effects; follow referenced template controls when imports change.

Review persisted fields through reset/deletion, retention and rollback. Check
whether timeout handling loses later authoritative evidence, whether stale results
can overwrite current state, and whether recovery preserves enough information to
finish the user's task. Verify transaction claims under the relevant supported
isolation/version behavior; a mock or one database version is not universal proof.
Use the actual CI dependency layout for environment-sensitive tests.

Map each material acceptance criterion and reviewer finding to evidence or an
explicit gap. A passing suite, build or complete-looking checklist is not by itself
a readiness verdict. Classify evidence as source inspection, mocked behavior,
component/browser check, real database test, or end-to-end integration as applicable.
Do not declare ready while a material finding or safety-critical assumption remains
unresolved. State narrower verified results and what remains unverified instead.
Independent review adds confidence for consequential changes when authorized and
available; do not invent an independent pass or impose a new approval gate.

## Findings and convergence

Each finding needs a concrete failure scenario, location, evidence and consequence.
Actively try to refute it through existing wrappers, callers, tests, or alternate
paths. Report critical/important defects before minor issues. Separate material
design alternatives from actual defects; do not silently rewrite working designs.

When fixes are authorized, make a scoped fix wave, rerun affected checks and review
changed assumptions. Stop when the criteria and relevant checks pass. If blocked,
identify the exact missing evidence or decision; do not call the result green.
Do not repeat full panels or tests without a change or unresolved concern.
On a scoped retest, report which findings were verified fixed. Do not broaden that
result into overall UI readiness unless the visual and journey evidence supports
it; retain earlier review limits that the retest did not address.

Return findings (or no substantiated findings), coverage, executed verification,
and residual risks. A clean result means no identified defects within the reviewed
scope, not a guarantee. Do not merge or publish merely because a review is clean.

## Codex execution

Use the session model, targeting `gpt-6-astra`. These dimensions are self-contained;
no external review skill is required. Delegate only when explicitly authorized and
supported, inheriting the selected model. Otherwise assess dimensions sequentially
and disclose that this was a single-agent review, not independent verification.
