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
Read the plan plus the code it will touch; state ground-truth facts (what exists, the patterns to follow, the real constraints). Write a short **shared context file** handed to every design-critic, so each names only its own dimension — use the **template in Appendix A** (plan path, code snapshot + SHA, verified facts, **LOCKED decisions**, conventions, output format). Before dispatching, do four things the panel can't do for itself:

- **Pin the code snapshot.** Review against an exact commit (e.g. `git archive origin/<trunk>` into a scratch dir) and record the SHA, so every `file:line` in the plan and in the findings refers to the same code. When asked "what already exists", check **remote branches and open PRs**, not only the trunk.
- **Verify every framework / library claim.** List each place the plan relies on how the framework, ORM, DB or a library behaves (e.g. "set-only-once allows filling a blank", "read-only blocks writes", "this lock refreshes what I read", "the cache survives a deploy", "this query applies permissions"). Check each against the framework's **source** (not memory, not docs alone) and record the verified behaviour in the context file. A wrong framework assumption costs a whole review cycle to catch later.
- **Audit every reuse or redefinition.** Whenever the plan reuses or changes the meaning of an existing field, flag, setting, status or mechanism, enumerate its **current readers and writers, its documentation, and its current production value** before the panel runs. Redefining an existing thing is where silent breakage hides (a status that suddenly blocks signups, a customer-facing hold reused as an internal marker, a "refused" value that real operators depend on).
- **Ask the human for the facts only they have — up front.** Production topology and current values, which environments exist, whether something is live, what's configured (e.g. mail). Put these as a short "facts I need from you" list at the start of cycle 1, not mid-loop; never rely on a remembered fact that may be stale — confirm it.

## 3. Dispatch the panel — the SAME dimensions as /review-loop, in DESIGN-CRITIC mode
One **fresh design-critic per dimension**, in parallel each cycle, each on **Opus 5.5 at high effort** (see **Model assignment** below). **Never drop a floor dimension.** Each asks, for its lane: *what could go wrong, what is the plan silent about, what decision is being made implicitly, and what must be true for this to be correct / safe / operable?*

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
- **Frontend & UX** (any user-facing change) — the states (loading / empty / error / success), the flow and the one primary action, accessibility, i18n, and **design-system conformance** are designed up front, not retrofitted. Pull the full checklist from `/review-loop`'s Frontend + UX lanes. **The acceptance criteria must include a real-Chrome check through Playwright** (widths, keyboard path, focus, long content, screenshots read) naming the screens and states it will cover — a UI plan whose only proof is component tests is under-designed.
- **Deployment, rollout & migration** (schema / data patch / flag / config / deps / infra) — migration reversible + idempotent + **tested on populated data**; backfill bounded / resumable; **how existing records / users / state transition to the new behavior** (backfill / grandfather / dual-run) — distinct from schema mechanics; feature-flag default + **rollback rung**; cross-repo deploy order; a clear rollback path; **rollout validation** — how we prove it works in prod (flagged / canary / dogfood rollout, what we watch during it, the rollback trigger).

## Model assignment (SOP)
**Planning is done by Opus 5.5 at high effort.** Every design critic in this command, on every dimension and in every cycle, and the regression-sweep critic, is dispatched with `model: "opus"` and `effort: "high"`. The controller (the main loop) scouts, aggregates and adjudicates on Opus 5.5 at high effort as well. No Sonnet, Haiku or Fable in planning.

If the session's own model is not Opus 5.5, say so at the start and give the aggregation and the hardened plan to an Opus 5.5 high-effort agent rather than writing them in the main loop.

Dimensions may still be GROUPED onto fewer critics to respect a workflow size limit (related dimensions together); no dimension may be dropped, and none may run on a smaller model.

## 4. Loop to a coverage-gated green
- Aggregate every dimension's findings. For each **gap**, either the plan is revised / a design decision is made, or it is recorded as a **deliberate, explicit deferral** — never a silent one.
- **Keep a findings ledger** (`findings-ledger.md` next to the context file): one row per finding — `id · dimension · severity · summary · status (open / closed / deferred) · how it was resolved (plan § or decision)`. Critics are fresh each cycle and otherwise start cold; hand each critic **its own prior findings from the ledger** and require it to mark every one *closed* or *still open* (with evidence) **before** looking for new ones. Never close a finding on the controller's say-so alone.
- **Every revision of the plan carries a "Changes since rev N" section.** Fixes introduce new defects; next cycle's critics check the changed parts **first**.
- **Tier the cycles** (cost-aware, same coverage):
  - **Cycle 1** — the full panel.
  - **Cycle 2+** — re-dispatch only the dimensions with an open finding, **plus one regression-sweep critic** that reads only the "Changes since" section against every dimension. A dimension already *accounted for* carries its verdict forward unless the regression sweep flags it.
  - **Cycle 3+ bar** — flag only what would cause a **wrong design choice** or a **defect the implementation plan can't catch**; everything else is *safe-to-defer to the implementation plan*. This is the stop rule against endless polish.
- **Count what you dispatched.** Track *N dispatched / N reported* each cycle; never declare a cycle complete (or claim "all reported") until every critic's report is actually in hand.
- **Coverage gate:** the plan is pressure-tested only when **every dimension returned an explicit verdict** — *design accounts for it* or *deliberately deferred*. A dimension that never reported = not covered = **not done**.

## 5. Output — the hardened plan
1. **Ranked gaps & risks**, most-consequential first, each tagged with its dimension.
2. **Decisions to lock** — the choices the plan is making *implicitly* (fail-open / closed, migration strategy, observability plan, UX states, scope cuts). **Surface these for the human to decide — never silently invent a requirement or a decision** (factual gap → read the code; intent / scope decision → ask). Split them into two lists:
   - **Decisions needed from you** — real intent / scope / cost choices. Ask them **one at a time**, in plain language: **context first** (what it is, where it lives, why it matters now), then *what you'd notice* under each option, then the options with the **recommended one first** and why. No jargon the human hasn't used; answer a clarifying question before re-asking.
   - **Engineering defaults I adopted** — choices with one clearly right answer, listed so the human can override any of them, not asked one by one.
3. **Acceptance criteria** — a per-dimension "definition of done." These are the bridge: development **builds to** them, and **`/review-loop` verifies against** them.
4. **Verdict** — ready to implement, or needs decisions / revisions first (and exactly which).
5. **Share it (optional)** — offer to publish the hardened plan / findings as an HTML page (and save a standalone copy to the Desktop) for review with others.

## Guardrails
- **Planning only — write no code.** The deliverable is a hardened plan + locked decisions + acceptance criteria.
- **Scale rigor to the stakes.** Flag under-design (a missing safeguard on a risky path) AND over-design (ceremony a low-stakes change doesn't warrant). Separate **must-decide-now** from **safe-to-defer**.
- **Proof, not assumption.** Ground every claim in the actual codebase; for a factual unknown, read the code; for an intent / scope decision, ask the human.
- Keep design / plan docs **local and untracked** — they do not go in code PRs.
- Hand the acceptance criteria forward to `/review-loop` when the build is done.

## Appendix A — shared context file template
Write this once in cycle 1 (in a scratch / job temp dir, not the repo) and append a `## CYCLE N` section each cycle.

```markdown
# Shared context — /plan-check on <plan name>
PLAN UNDER TEST: <absolute path>   (read it fully first)
Parent / related docs: <paths>
Mode: DESIGN CRITIC. Read-only — modify nothing; never run destructive suites.

## Code snapshot
<scratch path of the pinned snapshot> @ <repo>:<SHA> (+ framework source path for behaviour checks)

## Verified facts (ground truth — build on these, don't re-prove)
- <fact> — <file:line or framework source:line>
- Framework behaviour checked: <claim> → <verified result, source:line>

## Facts from the human
- <production topology / config / environment facts confirmed this session>

## LOCKED decisions (do not relitigate; you may flag a concrete safety consequence)
- <decision> (who decided, when)

## Conventions
<repo rules: test sites, raw-SQL policy, formatting, CI, migration rules>

## Output format (per dimension you own)
1. VERDICT: accounted for | gaps | deliberately deferred
2. PRIOR FINDINGS (cycle 2+): each of your ledger items → closed / still open, with evidence
3. NEW FINDINGS ranked: severity · gap · evidence (plan § + VERIFIED file:line) · what must be true · must-decide-now or safe-to-defer
4. DECISIONS TO LOCK (true intent/scope questions only, with recommended answer)
5. ACCEPTANCE CRITERIA additions (testable)

## CYCLE N
What changed (link the plan's "Changes since rev N"), the bar for this cycle, word limit.
```

## Appendix B — findings ledger format
```markdown
| id | dim | sev | summary | status | resolution |
|----|-----|-----|---------|--------|------------|
| C1-SEC-1 | security | High | guest can set routing header | closed | plan §4.4 (option 1, user) |
| C2-RES-3 | resilience | Med | lookup failure wedges cell | open | — |
```
Ids are `C<cycle>-<DIM>-<n>`; never delete rows — close or defer them with a reason.
