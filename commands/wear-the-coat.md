---
description: Persona-driven UX & functional-completeness review — wear the coat of a profession that uses a flow and audit their lived experience (coverage · gaps · good-to-haves · failure & recovery)
argument-hint: "<feature/flow or path> [as a <role> managing <X> doing <Y>, ...] | suggest [+focus]"
---

# /wear-the-coat — persona-driven UX & functional-completeness review

Point this at a **feature / user-journey** and summon one or more **professions who actually use it**. The reviewer *puts on the coat of that person* — their role, their industry, what they manage, the job they came to do — and walks the flow from inside that coat, asking the one question the builder-facing gates can't: **when a real person whose job depends on this walks the flow, can they do it quickly, safely, and without friction?**

This is the **third gate, on the *user* axis** — complementary to, never a replacement for:

```
/plan-check     → design soundness    (front gate,  builder axis)
/review-loop    → build quality       (back gate,   builder axis)
/wear-the-coat  → lived experience    (either side, USER axis)
```

It is **report-only**: it emits a ranked, evidence-anchored report and hands off. A gap worth building flows into your normal path (`/plan-check` → plan → `/review-loop`). It never fixes, and never merges.

**Scale to tier** (Risk-Tiered Three-Gate SOP — classify by blast radius × reversibility): **T0/T1** → one quick lens, or an inline note · **T2** → 1–2 lenses + light verify · **T3** → the full multi-lens panel + verify + cross-lens synthesis. Round up when unsure.

First, load the **`quality-code-review`** skill — the **Failure & recovery** axis (§D) is backed by its §8 (error-message quality) and §1 (atomicity / no partial commits). When the flow is a Frappe app, the map-phase explorers also load **`frappe-app-dev`**. The persona-experience rubric itself is defined below.

## 1. Resolve the target from `$ARGUMENTS`
The argument is **a flow + who wears the coat + optional focus**:

- **a described flow** (e.g. `the leave-application flow`) → review that whole journey.
- **a path** (e.g. `app/jarvis/tools`) → scope the flow to what that area serves; then suggest personas.
- **`as a <role> managing <X> doing <Y>`** clauses → the coats to wear, each a job-story. Multiple clauses = multiple lenses on the same journey.
- **`suggest`** (or no persona given) → map the flow first, then **propose realistic personas** (each as a job-story) and ask the user to pick before wearing any coat.
- **trailing free text** → extra focus (e.g. `+mobile`, `focus on month-end`).

Weigh the **latest changes** in: diff the current branch against the repo trunk (detect it — `develop` / `main` / `master`; in the jarvis repos it is `develop`). A change is judged **inside the full flow**, not in isolation — a locally-perfect diff can still break the journey. When there is no diff, review the flow as-is.

Respect the project's `CLAUDE.md` and memory (trunk name, repo layout, test sites, conventions). **Never assume — read the code.**

## 2. Map the flow (facts, no opinions)
Dispatch explorer subagent(s) to read the journey **end-to-end across every surface it touches** — in jarvis a single flow can span the Vue SPA + the Python tool layer + the HTTP API + the persona repo, so **follow it across repo boundaries, do not stop at one checkout** — plus the latest diff. They write a **facts-only journey map** to a shared context file:

- the steps, in the order the user hits them; the states each step can be in;
- the options / actions that exist at each step; what is gated (by permission, role, config) and what is automated;
- **where it can fail** (each external call, validation, write, permission check) — the raw material for §D;
- `file:line` anchors throughout.

**Facts before opinions:** no coat judges a guess. This map is ground truth; it names what exists, never what *should*.

## 3. Cast the coats
Build each coat as a **grounded persona card** from `role + domain + what-they-manage + job-story` — never a bare label. A card states:

- **who** — role, the industry the software actually serves, their scope of responsibility;
- **the job-story** — what they came to accomplish *this time* (the same role finds different things closing the till vs. investigating a discrepancy);
- **their reality** — daily volume, goals, what they fear getting wrong, tech comfort, and the moments they are rushed / interrupted / under deadline.

If `suggest` was asked, propose personas off the map and let the user pick. If a summoned persona **wouldn't realistically touch this flow**, say so and push back — do not invent needs to justify a bad coat.

## 4. Wear the coats — dispatch the panel
One **fresh subagent per lens (per coat), in parallel**, each judging the *real* journey map against its persona. Each lens evaluates **four axes** — the happy path (A–C) and the unhappy path (D). Every finding carries a `file:line` anchor and a one-line **why it matters to *this* persona**.

- **A · Coverage** — for each need the persona has to do their job: ✅ satisfied · ⚠️ partial · ❌ missing, with evidence. *("Does it satisfy all the cases.")*
- **B · Gaps** — the ❌/⚠️ that **block or slow** the persona's real job. *("The missing things.")*
- **C · Good-to-haves** — delighters that would make the persona's life easier. Held to **YAGNI + user-impact ranking** — a "delighter" that is really gold-plating is flagged as such, not proposed. *("Nice-to-have in the flow.")*
- **D · Failure & recovery** — for each failure point on the map, enumerate the realistic failure modes *this persona* could hit (network drop mid-submit, validation reject, permission denied, timeout, external service down, concurrent edit, partial save), then judge **two things from inside the coat**:
  - **System handling** — does it fail *safely*? No lost work, no silent corruption, atomic / rolls back, retry-safe. *(Does my half-typed record survive? Does a failed post leave a phantom entry?)* — backed by `quality-code-review` §1.
  - **User surfacing** — does the persona **see** it failed, understand **why**, and know **what to do next**? Specific and actionable in *their* language — not "Error", not a stack trace, not a blank card — backed by `quality-code-review` §8 and the **capability-states convention** (off / unconfigured / error / empty / no-perm each state *why*).
- **Simplicity of flow** (cross-cutting, not a fifth score) — across A–D, does the lived journey ask this persona to do **more than the task needs**: extra steps, extra concepts to hold in their head, or ceremony a simpler flow would remove? Judged as **experience-simplicity** — the persona's felt friction, not a code critique. *("Am I being asked to do more than this job actually requires?")* A forced extra step is a **B · Gap**; a step that could be trimmed without losing anything is a **C · Good-to-have** (trim, don't add).

Each lens stays inside its coat, is exhaustive (trickling findings wastes cycles), and **must return all four axes** — a lens that skips §D is incomplete.

## 5. Verify — the cry-wolf killer
Every **❌ / ⚠️ "missing / broken / unhandled"** finding goes to an **adversarial verify** subagent before it is allowed into the report: *try to prove the thing already exists / already works / is already handled somewhere in the flow.* A finding that verify can refute is dropped. No "you should add X" that already lives three files over; no "unhandled failure" that a wrapper already catches.

- **Verify the map, not just the findings.** The costlier error is a *right finding on a wrong map* — a whole coat reasoning off a ground-truth claim that isn't true. So the verify pass also spot-checks the map's **load-bearing facts** (the ones several findings hang on), not only the findings themselves. A finding whose underlying map-fact collapses is dropped with it.
- **Diversify the angle — don't re-read the same code the lens read.** A verifier that reads exactly what the lens read shares its blind spots. Give each check a *different* attack: **search by synonym / alternate name** (the feature may exist under another word), **look for the test** that would cover the behavior, **check the git history** for when the thing appeared or was removed, or **run the click-test** when one is cheap. Refutation from a fresh angle is worth more than agreement from the same one.

## Model assignment (cost-aware)
Use the **least-capable model that does the role well**. The **controller** (main loop) scouts, casts, aggregates, ranks, and runs the coverage gate at no extra agent cost.

- **opus** — the load-bearing judgment: a persona lens on a **high-stakes / regulated / stateful** journey.
- **sonnet** — the **default**: explorers, persona lenses on ordinary flows, adversarial verify.
- **haiku** — mechanical bookkeeping / de-dup.
- **fable** — expensive; **never per-lens**. Reserve for a single optional tie-break on a load-bearing failure-safety call.

| Role | Model |
|---|---|
| Map / explorer (cross-repo, + diff) | sonnet |
| Persona lens — ordinary flow | sonnet |
| Persona lens — stateful / regulated / high-volume flow | **opus** |
| Adversarial verify | sonnet → haiku for a trivial existence check |
| Cross-lens synthesis | controller, or **opus** when roles conflict sharply |
| Optional tie-break on a Critical failure-safety finding | **fable** or opus |

## 6. Synthesize & the coverage gate
- Aggregate every lens's findings; de-dup across coats.
- **Rank everything by user impact = how often this persona hits it × how much pain / risk when it's absent** — *not* technical severity. Assign each an impact of **High / Medium / Low**.
- **Impact floor — fold the tail.** Low-impact findings are **folded into a single one-line "also noted" list**, never enumerated as full findings — a long ranked list reads as thorough but buries the signal.
- **The "act-now ≤3" forcing function.** The synthesis MUST name **at most three findings worth acting on now** (the ones that actually block the job or endanger the person) and demote everything else to a **"noted, not now"** bucket. Sorting is not deciding — make the cut. When two coats' act-now items overlap, that shared finding leads.
- **Coverage gate:** the review is complete only when **every summoned coat returned an explicit verdict on all four axes**. A coat or an axis that never reported = not covered = **not done** (visibly missing, never silently skipped).
- **Cross-lens synthesis** when several coats ran: where roles **conflict** (the clerk wants speed, the auditor wants friction) and where **one gap hurts everyone**.

## Report — the seven parts
Present in-conversation, most-impactful-first, and offer to save the report to `docs/superpowers/reviews/YYYY-MM-DD-wear-the-coat-<flow>.md` (kept local, untracked) for hand-off. **Open with the "act-now ≤3" list from §6** — the reader sees the decisions before the detail.

1. **The coats** — each persona card; plus any personas suggested-and-picked.
2. **Journey map** — the facts-only flow from §2, so every finding anchors to real code.
3. **Coverage** — the ✅ / ⚠️ / ❌ table (axis A).
4. **Gaps** — axis B, ranked by user impact, each with `file:line` + the fix direction; Low-impact ones folded into one "also noted" line (per §6).
5. **Good-to-haves** — axis C, ranked; gold-plating flagged.
6. **Failure & recovery** — axis D: per failure mode → system-handling verdict + user-surfacing verdict, gaps ranked.
7. **Cross-lens synthesis** — conflicts and shared gaps.

**Live-check appendix (whenever any finding is "needs live check").** Static reading has a ceiling — especially on axis D, whose whole point is failure UX. So every static-unverifiable finding must leave a **runnable click-test**, not a dead label: an ordered list where each item states the **exact action** to perform, **what to look for**, and **which finding it closes** — e.g. *"1. In the Desk widget, open a pending create → is a Discard control present? → closes gap #6."* **When the flow has a UI, run the click-tests yourself** — open the screens in real Chrome through Playwright (the Playwright *library*, `chromium.launch({ channel: "chrome" })`, the API answered in the script or a test site; for the Jarvis SPAs use `tools/ui-browser-check/` from the claude-tool repo (`run.sh <frontend-dir> <check.mjs>`, `example.mjs`, README; local copy at `~/review/tools/ui-browser-check/`)), at desktop and phone widths and with real key presses, take screenshots and read them, and report each item as **confirmed / refuted** with what was seen. Only what genuinely cannot be reproduced that way (a real tenant, a live model, production data) stays on the list for the human.

End with a one-line hand-off: which of the act-now items to take into `/plan-check` or a plan.

## Guardrails
- **Verify before you claim** — §5 gates every "missing / broken" finding **and the map's load-bearing facts**, from a **different angle than the lens read**. Cry-wolf — a false gap, *or* a right finding on a wrong map — is the cardinal failure of this review.
- **Facts before opinions** — no coat judges a guess; the map is ground truth.
- **Static-read honesty** — anything that truly needs a running click is **labelled "needs live check" and handed a runnable click-test in the Live-check appendix** (never a bare dead-end label), never asserted. **UI findings are checked in real Chrome through Playwright before they are reported** (see the Live-check appendix) — against a locally served copy with a mocked API or a test site. Never drive a production or shared site, and never a live bench's real data.
- **Persona-mismatch pushback** — refuse to invent needs for a persona who wouldn't use the flow.
- **YAGNI on good-to-haves** — user-impact ranking + an explicit gold-plating flag keep the delighters honest.
- **Rank by the user, not the code** — impact = frequency × pain for *this* persona, not technical severity.
- **No finding-inflation** — the synthesis cuts to **≤3 act-now** items and folds Low-impact findings into a single line; sorting is not deciding.
- **Report-only** — no fixes, no merges; hand the ranked gaps back to the normal build path.
- Keep the report and any design docs **local and untracked** — out of any code PR.
