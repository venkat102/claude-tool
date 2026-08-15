---
description: Planning pressure-test — stress a plan / spec / approach against every quality dimension BEFORE code (front-gate mirror of /review-loop)
argument-hint: "[plan|spec path | feature description | blank = the plan under discussion] [+focus]"
---

# /plan-check — planning pressure-test (shift-left)

Stress-test a **plan, spec, feature idea, or approach** against every quality dimension **before any code is written**, so defects are *designed out* instead of *reviewed out*. This is the **front gate**; `/review-loop` is the back gate — they share one dimension vocabulary, so an issue is either designed out here or caught there, never both-missed. Apply with **no compromise**, in every project.

**Scale to tier** (Risk-Tiered Three-Gate SOP — classify by blast radius × reversibility): **T0/T1** usually skip (a quick inline criteria note suffices) · **T2** LITE (controller + 1–2 opus critics on the load-bearing dimensions) · **T3** the full panel below. Round up when unsure.

First, load **`quality-code-review`** — the same dimension rubric, but here every item is re-pointed **forward**: not "what's broken" but *"how does the design handle this, what could go wrong, and what must be true?"*

## 1. Resolve the target from `$ARGUMENTS`
- **empty** → the plan / spec / approach under discussion in this session (or the newest file in `docs/superpowers/{plans,specs}/` if one exists).
- **a path** → that plan / spec / design file.
- **free text** → the described feature or change — treat it as the proposal to pressure-test.
- **trailing free text after a target** → extra focus (e.g. `+security`, `focus on the migration`).

Respect the project's `CLAUDE.md` and memory. Read enough of the **existing codebase the plan touches** — patterns, constraints, what it integrates with — so this is a real design review, not a generic checklist.

## 2. Scout & build shared context
Read the plan plus the code it will touch; state ground-truth facts (what exists, the patterns to follow, the real constraints). Write a short **shared context file** handed to every design-critic, so each names only its own dimension.

## 3. Dispatch the panel — the SAME dimensions as /review-loop, in DESIGN-CRITIC mode
One **fresh design-critic per dimension**, in parallel each cycle, each on the model assigned in **Model assignment** below (cost-aware — Opus for the load-bearing judgment dimensions, Sonnet for the rest, **not Fable-per-dimension**). **Never drop a floor dimension.** Each asks, for its lane: *what could go wrong, what is the plan silent about, what decision is being made implicitly, and what must be true for this to be correct / safe / operable?*

### Always-on planning dimensions
- **Problem & success definition** — are we solving the **right problem**, framed crisply? The user need / job-to-be-done behind the request (not just the requested solution); **measurable success criteria** — how we'll know it worked; who the stakeholder is and what "good" means to them. A plan that solves a fuzzy or wrong problem passes every technical dimension and still fails.
- **Approach & alternatives** — is this the **right** approach? What's the simplest thing that works (**YAGNI**)? 2–3 alternatives with tradeoffs and why this one wins. Is any part **over-engineered for the stakes** or **under-designed for the risk**? (Both are defects — a nudge does not need a distributed-systems recovery design; a ledger does.) Make the probe **concrete**: for each mechanism, is the heavier option justified by the stakes — a **hash / fingerprint vs. a direct compare**, a **bespoke build vs. reusing an existing primitive**, a **derived token vs. the value itself**, a **new layer vs. none**?
- **Scope & decomposition** — is this one coherent, independently-testable unit, or should it split into sub-plans? What is explicitly **out of scope**? Are the boundaries and interfaces between pieces clear?
- **Incremental delivery & phasing** — the **smallest shippable slice** / walking skeleton first; can it land in safe increments (behind a flag) rather than big-bang? Milestones ordered so the **riskiest unknown is proven earliest**, not last.
- **Assumptions & unknowns** — surface **every assumption the plan rests on** and every open unknown; mark the **load-bearing** ones; de-risk those with a spike / proof-of-concept **before** committing the full build. Surfacing an assumption is far cheaper than discovering it wrong in code.
- **Risks, dependencies & sequencing** — the top risks ranked, each with a mitigation and an **abort / change-course criterion**; **blocking dependencies** (another team's work, an external API, a decision not yet made, a library that doesn't exist yet) and the critical path — what must land first.

### The eight floor dimensions (mandatory — mirrors /review-loop)
- **Correctness & stability** — the invariants that must hold; the "failure-is-not-an-option" paths (stateful / ledger / compliance); where it could corrupt state silently; whether it changes semantics others depend on; stated locale / timezone assumptions.
- **Security & data handling** — trust boundaries drawn; the authz model; **tenant isolation guaranteed by design** (no cross-tenant / cross-user leakage); secrets / PII / retention / audit planned; **compliance / legal / data-residency** where the data is regulated; the attack surface of any new entry point.
- **Performance, concurrency & cost** — hot paths and a complexity budget (O(1) / O(log n) on frequent calls); indexes planned; races and locking designed out (a DB unique constraint over check-then-act); no N+1 by design; **runtime cost & capacity at scale** — the compute / storage / API / **LLM-token** / third-party $ footprint at N× load, not just latency.
- **Edge cases & gaps** — enumerate the corner cases **now**: empty / null / huge / malformed input, concurrent actors, partial failure, boundary values, permission variations — and the plan for each.
- **Maintainability & API** — module boundaries (one responsibility each); interface design (least astonishment, no overloaded params); back-compat; extends shared components vs forks; fits existing patterns.
- **Testing strategy** — the test plan up front: what TDD will drive, what mutation-verification targets, how the risky / stateful part is covered, determinism.
- **Resilience & failure modes — code, flow, and handling mechanisms** — **Per dependency:** down / slow / **dies mid-operation** / message lost → what happens? Is recovery **guaranteed** (not riding a single cron / scheduler)? Idempotent / replay-safe / retry-safe? **Fail-open vs fail-closed decided deliberately.** Graceful degradation; bounded timeouts and queues; **no permanent stuck state.** **Flow level — is the whole end-to-end path designed for failure at every hop** (request → queue → worker → external call → callback → state write, *across process / service seams*)? A partial run must leave **no orphaned / half-written state**; each step idempotent so retrying the whole flow is safe; a **reconciliation / recovery path** designed in for any flow that can wedge (and it can't itself wedge). **Handling mechanisms — is the failure-handling machinery itself specified and sound:** retry (backoff + cap + idempotency), timeout, circuit-breaker, dead-letter / poison-message handling, compensation / rollback / saga, fallback / degradation, errors **propagated not swallowed**, at-least-once vs exactly-once chosen on purpose, and an **alert on failure** — each present where the risk warrants and not itself a new failure source. (Match the machinery to the stakes — a nudge needs none of this; a ledger or a fleet roll needs most of it.)
- **Operability & observability** — what **alert / metric / log / dashboard ships with the feature** so you'd know it broke in prod? Time-to-detect? A runbook for on-call? Does any critical path fail silently?

### Conditional dimensions (add when the plan warrants)
- **Frontend & UX** (any user-facing change) — the states (loading / empty / error / success), the flow and the one primary action, accessibility, i18n, and **design-system conformance** are designed up front, not retrofitted. Pull the full checklist from `/review-loop`'s Frontend + UX lanes.
- **Deployment, rollout & migration** (schema / data patch / flag / config / deps / infra) — migration reversible + idempotent + **tested on populated data**; backfill bounded / resumable; **how existing records / users / state transition to the new behavior** (backfill / grandfather / dual-run) — distinct from schema mechanics; feature-flag default + **rollback rung**; cross-repo deploy order; a clear rollback path; **rollout validation** — how we prove it works in prod (flagged / canary / dogfood rollout, what we watch during it, the rollback trigger).

## Model assignment (cost-aware)
Use the **least-capable model that does the dimension well**. The **controller** (main loop) scouts, aggregates, adjudicates, and runs the coverage gate at no extra agent cost.

- **opus** — the **load-bearing judgment** dimensions, where getting it wrong is expensive.
- **sonnet** — the **default** for the rest.
- **haiku** — mechanical checks / bookkeeping.
- **fable** — expensive; **never per-dimension**. Reserve for a single **optional** tie-break on a load-bearing approach / resilience / correctness call.

| Dimension | Model |
|---|---|
| Problem & success definition | **opus** |
| Approach & alternatives | **opus** |
| Correctness & stability | **opus** |
| Security & data handling | **opus** |
| Resilience & failure modes (code, flow, mechanisms) | **opus** |
| Scope · Incremental delivery · Assumptions · Risks/deps/sequencing | sonnet |
| Performance, concurrency & cost | sonnet |
| Edge cases · Maintainability & API · Testing strategy | sonnet |
| Operability & observability | sonnet |
| Frontend & UX | sonnet |
| Deployment, rollout & migration | sonnet → **opus** when it's the core of the change (data migration / rollout is load-bearing) |

## 4. Loop to a coverage-gated green
- Aggregate every dimension's findings. For each **gap**, either the plan is revised / a design decision is made, or it is recorded as a **deliberate, explicit deferral** — never a silent one.
- Re-dispatch the **full panel** next cycle. Gaps should **narrow each cycle**.
- **Coverage gate:** the plan is pressure-tested only when **every dimension returned an explicit verdict** — *design accounts for it* or *deliberately deferred*. A dimension that never reported = not covered = **not done**.

## 5. Output — the hardened plan
1. **Ranked gaps & risks**, most-consequential first, each tagged with its dimension.
2. **Decisions to lock** — the choices the plan is making *implicitly* (fail-open / closed, migration strategy, observability plan, UX states, scope cuts). **Surface these for the human to decide — never silently invent a requirement or a decision** (factual gap → read the code; intent / scope decision → ask).
3. **Acceptance criteria** — a per-dimension "definition of done." These are the bridge: development **builds to** them, and **`/review-loop` verifies against** them.
4. **Verdict** — ready to implement, or needs decisions / revisions first (and exactly which).

## Guardrails
- **Planning only — write no code.** The deliverable is a hardened plan + locked decisions + acceptance criteria.
- **Scale rigor to the stakes.** Flag under-design (a missing safeguard on a risky path) AND over-design (ceremony a low-stakes change doesn't warrant). Separate **must-decide-now** from **safe-to-defer**.
- **Proof, not assumption.** Ground every claim in the actual codebase; for a factual unknown, read the code; for an intent / scope decision, ask the human.
- Keep design / plan docs **local and untracked** — they do not go in code PRs.
- Hand the acceptance criteria forward to `/review-loop` when the build is done.
