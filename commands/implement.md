---
description: Implementation companion — build to /plan-check's acceptance criteria with the quality dimensions as live guardrails (TDD + per-task review); the bridge between /plan-check and /review-loop
argument-hint: "[plan|spec|criteria path | task | blank = the plan under discussion] [+focus]"
---

# /implement — build to the criteria (the middle gate)

Implement a plan **against the acceptance criteria** from `/plan-check`, carrying the same quality dimensions in as **live guardrails** — written into each unit as you build it, never retrofitted. This is the middle gate:

> `/plan-check` (design quality in → **acceptance criteria**) → **`/implement`** (build it in) → `/review-loop` (verify against them)

**Scale to tier** (Risk-Tiered Three-Gate SOP — classify by blast radius × reversibility): **T1** the controller runs this loop inline (fix + TDD + mutation-verify + self-review, no per-task subagents) · **T2/T3** per-task subagent build + review. Round up when unsure.

Load the skills that fit the work as you go: **`test-driven-development`**, **`subagent-driven-development`** (per-task build + review), **`code-style`**, **`verification-before-completion`**, and any stack skill (e.g. **`frappe-app-dev`** for Frappe). Follow the project's `CLAUDE.md` and memory (trunk name, test sites, commit trailer, conventions).

## 1. Resolve the target from `$ARGUMENTS`
- **empty** → the plan / spec / acceptance criteria under discussion in this session (or the newest file in `docs/superpowers/plans/`).
- **a path** → that plan / criteria file.
- **free text** → the task or feature to implement.
- **trailing text** → extra focus.

If there are **no acceptance criteria yet**, stop and run `/plan-check` first — building without the contract is exactly what this gate exists to prevent. (For a trivial one-liner, a lightweight inline criteria note is fine — scale to the stakes.)

## 2. Set up the workspace
- **Branch off the freshly-synced trunk** (detect it: `develop` / `main` / `master`; never implement on trunk directly). Sync first.
- Read the plan + the code it will touch; confirm the acceptance criteria and the file / module boundaries before writing anything.
- **Understand before editing** — trace the existing patterns, conventions, and abstractions the change touches, and **search for prior art to extend rather than reinvent** (a helper, utility, or shared component that already exists). Matching the codebase beats inventing a parallel way to do the same thing.
- Keep a **durable task ledger** so progress survives a context reset.

## 3. Build unit by unit — TDD, criteria-driven
For each task / unit, smallest testable slice first:
1. **Failing test first, derived from an acceptance criterion** — the test encodes the criterion so the plan and the code can't drift. Run it; confirm it fails for the right reason.
2. **Minimal implementation** to green — the smallest change that satisfies the criterion. Surgical, in the surrounding style, **YAGNI**; no scope creep, no "while I'm here."
3. **Write the dimension guardrails IN, now** — this is the shift-left the back gate can't give you:
   - **Resilience** — the dependency-down / times-out / **dies-mid-op** / message-lost path; **no permanent stuck state**; idempotent / retry-safe; the fail-open-vs-closed decision from the plan, honored.
   - **Observability** — the alert / metric / log the criteria call for ships **with** this code, not later.
   - **Edge cases** — a test for **each** corner case the plan enumerated (empty / null / huge / concurrent / partial-failure / permission variant).
   - **Security** — authz, tenant isolation, secrets, server-side allowlists — as designed.
   - **UX / i18n** (if user-facing) — the loading / empty / error / success states, a11y, translatable strings — built, not stubbed.
   - **Deployment artifacts** — if the unit needs a migration / data patch / flag / config, write it **here** and test it (a migration is code — test it on populated data), not as an afterthought.
   Then **prove each guardrail actually works** — trigger the failure path, confirm the alert fires, measure the target. A guardrail you wrote but never exercised is a guess, not a safeguard. Update the docstrings / docs / changelog the criteria call for **as part of this unit**, not a deferred pass.
4. **Mutation-verify the non-obvious guards** — break the guard, confirm a test goes red, restore (a green suite proves nothing until the test bites) — and **run the relevant existing tests too, not just the new one: the suite stays green, no regression.**
5. **Self-review, then review the task against its acceptance criteria** — first re-read your **own diff**: confirm you did **exactly** the criterion (no more, no less) and strip debug prints / dead code / scaffolding. Then a fresh reviewer (model per **Model assignment** below) scoped to *this task's* criteria + spec-compliance + code quality; **engage its findings with rigor** — verify each is actually right, push back on a wrong one with evidence, never blind-implement or performatively agree; fix Critical / Important; re-review to clean before advancing. Don't let defects accumulate to the back gate.
6. **Commit** the specific files (`git add <paths>`, never `-A`), pre-commit **enforced** (re-stage on reformat, never `--no-verify`), message ending with the project's required trailer. Mark the task done in the ledger.

### When things don't go to plan
- **Stuck or unexpected behavior → root-cause it.** Invoke `systematic-debugging`: understand the cause before any fix; no guess-and-check, no piling fixes on fixes. After ~3 failed fixes, question the approach — don't attempt a 4th blindly.
- **The plan turns out wrong or incomplete → stop and surface it.** The acceptance criteria are the contract; if reality contradicts them (a missing task, a wrong assumption, an impossible criterion), don't silently deviate — surface it and re-plan (`/plan-check`) or ask. Papering a plan flaw over in code is how the front gate's work gets lost.
- **Receiving the per-task review → engage with rigor** (`receiving-code-review`) — a suggested fix that would break something, or that's simply wrong, gets pushed back on with evidence, not implemented to make the finding go away.

## Model assignment (cost-aware)
Match the model to the task; the **controller** (main loop) plans, sequences, and adjudicates at no extra agent cost. **Never run Fable per task.**

| Task | Model |
|---|---|
| Transcription — the plan already contains the code | **haiku** |
| Standard implementation — prose spec, 1–2 files, integration | sonnet |
| Subtle / high-consequence — concurrency, security, the resilience or migration guardrails, multi-file | **opus** |
| Per-task review | sonnet — **opus** for the task's hardest dimension (correctness / security / resilience) |
| Mutation-verify · self-review | the implementing model, or **haiku** |
| Optional tie-break on a *Critical* finding | **fable** or opus |

## 4. Verify before claiming done
Run the **actual** test + build commands and read the output — evidence before assertions. Some runners (e.g. `bench run-tests`) **exit 0 even on failure**, so grep `FAILED` / `ERROR`. Tests run **only on test sites**, never real / prod. The build compiles. Every acceptance criterion has a passing test that would fail without the code.

## 5. Hand off
- Run **`/review-loop`** on the branch — the back gate verifies the whole diff against the full acceptance-criteria set, in the same dimension vocabulary.
- Fix what it finds, to a coverage-gated green.
- **Don't merge** — open the PR (design / plan docs stay OUT of it), share the URL; the user merges and closes.

## Guardrails
- Build **to the criteria** — not less (a missing criterion is unfinished) and not more (gold-plating is scope creep).
- **Proof, not assumption** — for a factual unknown read the code; for an intent / scope decision ask the human, never invent one.
- Match the surrounding code's style and patterns; extend shared components over forking; one responsibility per file.
- Keep the change surgical and reversible.
