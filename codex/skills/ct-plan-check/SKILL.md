---
name: ct-plan-check
description: Pressure-test a proposed plan or specification and produce concrete acceptance criteria before implementation.
---

# Plan checking

Review the supplied plan and the code it will affect. Resolve missing factual
information from the repository; ask about material product choices only when
context cannot settle them. Explicit user instructions and higher-priority
instructions take precedence. Do not require a separate approval ceremony when
the user already authorized the work.

Check the problem definition, scope, alternatives, assumptions, dependencies,
delivery order, and simplest viable design. A small reversible change needs a
brief criteria note, not a formal panel. For consequential changes, trace the
whole path across service and transaction boundaries.

## Review dimensions

| Dimension | Questions to resolve |
|---|---|
| Correctness | What invariants and existing semantics must hold? |
| Security/data | Who can act and read results? Are tenant boundaries and sensitive data protected? |
| Performance/concurrency | What happens at realistic load, cost, and concurrent execution? |
| Edge cases | What happens on empty, malformed, large, stale, or partial input? |
| Maintainability/API | Does this reuse existing mechanisms and preserve supported callers? |
| Testing | What independent observable outcome proves the change and catches regressions? |
| Resilience | What happens when a dependency is slow, fails, or dies after a partial write? |
| Operability | How is a failure detected, diagnosed, and recovered from? |

For UI work include loading/empty/error states, accessibility, locale, preserved
input, and the user's complete task. For migrations/deployment include populated
data, idempotency, mixed versions, configuration delivery, and rollback order.
Apply safeguards where the risk warrants them, not as a requirement to add every
possible mechanism to every change.

For each relevant dimension record covered, gap, deferred with rationale, or
not applicable. An unexamined dimension is unverified, not clean. Rank concrete
gaps by consequence and link them to evidence. Distinguish blockers from optional
improvements; a valid design need not be replaced by another valid preference.

## Evidence required by the plan

Turn the relevant failure scenarios into observable acceptance checks, including
prohibited side effects. For example, checking delivery must not dispatch work,
cancel a run, move a newer draft, or apply historical status as current readiness.
Challenge the proposal from the user's task and existing contracts, not just from
its chosen implementation. Identify what evidence would falsify the design.

For consequential state changes, check that tests distinguish failure before any
effect from an unknown outcome after a possible effect, and cover relevant races,
late outcomes, data deletion and rollback. Specify which checks need a real
transaction, browser or integration boundary; mocks alone cannot establish those
properties. Select relevant supported environments and CI's dependency layout.
Record unavailable environments and their impact instead of silently assuming
local results cover them. An unresolved assumption essential to safety or data
integrity prevents a ready verdict; it does not prevent independent authorized work.

## Deliverable

Return ranked gaps, material unresolved decisions, testable acceptance criteria,
and a ready/needs-revision verdict with limitations. Revise the plan within the
authorized scope. This skill alone does not authorize product code edits. If part
of an authorized build, hand the criteria forward without stopping unnecessarily.

## Codex execution

Use the current model, targeting `gpt-6-astra`; no external skill is required.
Use independent reviewers only when explicitly authorized and available, inheriting
the selected model. Otherwise perform a clearly labeled single-agent review.
Rerun checks affected by a revision; stop when material gaps are resolved or a
specific required decision/evidence remains unavailable. Do not claim guaranteed
correctness or repeat an unchanged full review indefinitely.
