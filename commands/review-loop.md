---
description: Multi-dimension Phase-1-floor team-lead review loop (branch diff, PR#, or path)
argument-hint: "[PR# | path | blank=current branch] [+extra lanes / focus text]"
---

# /review-loop — Phase-1-floor team-lead review

Run a **multi-dimension code review loop** with a mandatory Phase-1 eight-lane floor and a coverage gate. This is the standing review SOP — apply it with **no compromise**, in every project.

**Scale to tier** (Risk-Tiered Three-Gate SOP — classify by blast radius × reversibility): **T0** skip · **T1** controller self-review + *one* targeted reviewer on the riskiest lane · **T2/T3** the full panel below (**T3** also runs Codex `/codex:adversarial-review`). Round up when unsure.

First, load the **`quality-code-review`** skill — it is the per-lane rubric (the §-numbered checklist referenced below).

## 1. Resolve the target from `$ARGUMENTS`
- **empty** → the current branch's diff against the repo trunk (detect it: `develop` / `main` / `master`).
- **a number** (e.g. `124`) → GitHub PR #124 — fetch its diff with `gh`.
- **a path** (e.g. `src/support`) → scope the review to that path's diff.
- **trailing free text** → extra lanes or focus (e.g. `+UI`, `focus on the auth change`).

Respect the project's `CLAUDE.md` and any memory (trunk name, test sites, conventions). Never assume — read the diff.

## 2. Scout & build shared context
Read the diff plus enough surrounding code to state ground-truth facts. Write a short **shared review-context file** (ground-truth + the per-lane report shape) handed to every reviewer, so each dispatch names only its own lane.

## 3. Dispatch the panel — the mandatory Phase-1 eight-lane FLOOR
One **fresh reviewer per lane**, dispatched **in parallel** each cycle, each on the model assigned in **Model assignment** below (cost-aware — Opus / Sonnet / Haiku by lane difficulty, **not Fable-per-lane**). **Never drop a floor lane** — no "the change looks small" exception. Each reviewer stays strictly in its lane, is exhaustive (trickling findings wastes cycles), and carries its `quality-code-review` slice.

| Lane (ALWAYS dispatched) | Guards (quality-code-review § where it maps) |
|---|---|
| **Correctness & stability** | §1 — silent stateful corruption, stray commit/rollback mid-txn, validation-bypassed save/submit, changed long-standing semantics, mutate-while-iterating, return-shape/`None` assumptions; **locale / timezone** correctness (naive site-tz strings, translatable copy, locale-aware dates / numbers / currency) |
| **Security & data handling** | §2 — injection, whitelist **type-confusion** at trust boundaries, perms/`allow_guest`, secrets, server-side field allowlists; **multi-tenant isolation** (no cross-tenant / cross-user data leakage), PII handling + retention, **audit-logging of sensitive / admin actions** |
| **Performance & concurrency** | §3 + §4 — N+1 in request loops, unindexed WHERE/join, check-then-act races → DB unique constraint, `FOR UPDATE` on unindexed = whole-table lock |
| **Edge cases & gaps** | §1 corner cases + §7 scenario coverage — "how does this break / get misused?" |
| **Maintainability: readability / DRY / API** | §5 + §6 — guard clauses over nesting, clean code, forked **logic** (not just structure), back-compat, schema/data-patch footguns; docs / changelog updated for the next maintainer |
| **Testing & test quality** | §7 — patch coverage on the diff, a regression test per fix, **mutation-verified** non-obvious logic, deterministic + order-independent tests (no `random`/flakiness, `freeze_time` for time), a modified existing assertion explicitly justified |
| **Resilience & failure modes — code, flow, and handling mechanisms** | **Code level, per dependency:** **down / times out**, a process **dies mid-operation**, or a message is **lost** — **no permanent stuck state**; recovery is *guaranteed*, not solely dependent on one cron/scheduler; idempotent / replay-safe / retry-safe; **fail-closed vs fail-open chosen deliberately**; graceful degradation; bounded queues & timeouts. **Flow level — trace the whole end-to-end path the change lives in** (e.g. request → queue → worker → external call → callback → state write, *across process / service seams*): stress **every hop and handoff** — failed / slow / duplicated / out-of-order / lost — and confirm the **flow as a whole** reaches a consistent terminal state or safely recovers; **no orphaned or half-written state** from a partial run; each step idempotent so a retry of the whole flow is safe; the **recovery / reconciliation path exists, is itself tested, and cannot itself wedge**. **Mechanism level — audit the failure-handling machinery itself:** retry (backoff + cap + idempotency), timeout, circuit-breaker, dead-letter / poison-message handling, compensation / rollback / saga, fallback / degradation, errors **propagated not swallowed**, at-least-once vs exactly-once chosen on purpose, and an **alert on failure** — each present where the risk warrants, correct, and **not itself a new failure source**. The code-only view misses exactly the cross-step seams and half-built mechanisms where reliability is actually won or lost |
| **Operability & observability** | §8 — Google-able error titles, before→after values, preserved tracebacks; **plus:** if this silently breaks in prod, will we get an **alert**? is there a metric / log / dashboard to diagnose it and a runbook? what is the time-to-detect? no critical path fails silently |

**Plus one always-on pass, treated differently — Approach & simplification** *(surfaced, not gated)*: a fresh reviewer (opus) asking, now that the **real code** exists, **is there a materially better / simpler / more reliable way to achieve the same goal?** — a different design, an **existing primitive to reuse instead of a bespoke build**, a whole class of failure designed out. Concrete probes: **compare directly instead of hashing / fingerprinting small non-secret data**; **reuse an existing primitive instead of a bespoke build**; **send / compare the values instead of a derived token**; **drop a layer whose only job is guarding complexity the design itself introduced**. Flag only **material** wins (reliability, correctness, a big simplification), never style or preference. Unlike a floor lane its output is **not** a fix and does **not** block the green: it is **raised with the user to discuss (§5)** — the built approach may be entirely correct even when a better one exists, and switching is the user's call, never a silent rewrite. (This is the back-gate echo of `/plan-check`'s *Approach & alternatives*: a better design is often only visible once the code is real.)

**ADD lanes when the diff warrants** (floor is a floor, not a ceiling): the **Frontend lane** below whenever the diff touches UI (component files, templates, stylesheets, or a client / frontend source tree); the **UX & usability lane** below whenever the change is user-facing (a UI diff, or any change to a user-facing flow, message, error, default, or interaction — even from backend code); the **Deployment & migration lane** below whenever the diff touches migrations, data patches, feature flags, config, dependencies, or infra; the **chat-safety / shared-component** lane for chat changes; plus anything named in the trailing instructions.

### Frontend lane — dispatch whenever the diff touches UI
A dedicated reviewer covering, exhaustively. Framework-agnostic — map each item to whatever stack the project uses:

- **Design-system consistency** — new or changed UI must match the project's **existing design language, layout patterns, spacing, typography, iconography, component styles, and color scheme**. First read how the surrounding/existing UI is built, then verify the change conforms. Reuse the established **design tokens / variables / shared components** instead of introducing one-off colors, fonts, sizes, or a bespoke re-implementation of something that already exists. Flag any element that diverges from its siblings or from established patterns — a new visual treatment must be a justified, deliberate choice, never accidental drift.
- **Reactivity & state correctness** — reactive state stays reactive (not silently broken by copying/destructuring); derived values are pure and recompute on the right dependencies; a component never mutates state owned by its parent (one-way data flow); list items are keyed by stable identity, not position; view state resets when the route / params / selected entity change (in-progress input, selection, expanded/collapsed, fetched data).
- **Async & race safety** — out-of-order responses guarded (latest-wins: ignore a response whose target no longer matches the current view); in-flight work cancelled or ignored on unmount / context switch; every async call handles failure (no swallowed errors); no double-submit (disabled / pending guard).
- **UI states & interaction** — loading / empty / error / success are **all** designed (no blank state, no infinite spinner); optimistic updates roll back on failure; keyboard paths work (activate, dismiss, submit-shortcut, sensible tab order); expensive input is debounced/throttled; scroll behaves (auto-scroll on new content, preserve position on load-more); focus is managed (moves to the opened surface, trapped in a modal, restored on close).
- **Accessibility** — semantic, correct elements (an actionable control is a real button, not a clickable generic element); a logical **heading + landmark structure** and reading order; inputs have associated labels and their errors are **programmatically tied to the field** (required state announced, not color-only); asynchronous updates and notifications are announced to assistive tech; images have alt text; **keyboard-complete** — every action reachable, no keyboard trap, Escape closes overlays, a skip-to-content path; focus is always visible; reduced-motion **and forced-colors / high-contrast** modes are respected; content reflows usably at **200% zoom**; meaning is never conveyed by color alone; nothing flashes more than ~3×/sec; text/background contrast meets WCAG.
- **Theming & responsive** — every supported theme (e.g. light and dark) renders correctly, driven by theme tokens rather than hardcoded colors, and the override wins in both directions; layout adapts across widths (collapse or hide secondary panels, never force the page to scroll horizontally, let wide content scroll inside its own container); spacing/sizing use the design system's scale and relative units, and media is capped to its container.
- **Interaction states** — every interactive element designs its **full state set** — default / hover / focus-visible / active / disabled / loading / selected — with no ambiguous state; destructive actions carry a distinct danger affordance, not just another button.
- **Layout stability** — no cumulative layout shift: reserve space for images and async content so nothing jumps as it loads; a skeleton matches the final element's dimensions.
- **Content overflow & truncation** — long or dynamic content (names, emails, numbers, translated strings) truncates gracefully (ellipsis + the full value on hover / `title`) or wraps — it never clips, overlaps a neighbor, or forces the page to scroll sideways.
- **Internationalization (UI layer)** — all user-visible strings go through the i18n mechanism (none hardcoded, no concatenated sentence fragments); the layout survives **text expansion** (a translation ~30–40% longer) without clipping or overlap; **RTL** mirrors correctly where supported; dates / numbers / currency render locale-aware.
- **Frontend security** — never render user-supplied or otherwise untrusted content as raw markup (XSS); escape/encode before injecting into the DOM; open external links safely (no reverse-tabnabbing); no secrets or tokens in the client bundle or console output; client-side checks are UX only — the server is the real authority.
- **Frontend performance** — avoid needless re-renders and heavy work on the render path; lazy-mount / lazy-load heavy components and routes to keep the initial bundle small; no N+1 request pattern from a list (batch, paginate, or virtualize long lists); debounce network-driven input; release timers, subscriptions, and pollers on unmount.
- **Component design / DRY** — extend shared components instead of forking them; keep presentational/leaf components reusable and side-effect-free; expose parent-driven behavior through a well-defined, null-safe interface (safe under test doubles); a single source of truth (shared store vs. deep prop-drilling).
- **Testing & build** — new logic has unit/component tests, with **mutation-verification** of the non-obvious parts (a test that still passes when you break the code proves nothing); stub the environment traps a headless DOM lacks (viewport/media queries, object URLs, router, third-party UI modules, rich editors); the project builds/compiles with no template or type errors; the enforced formatter/linter passes — let it reformat and re-commit, never bypass the hooks; **a real browser / interaction run is the true gate** for layout, focus, and interaction behavior a headless DOM can't exercise — it is mandatory, see **Real-browser gate** below.

### UX & usability lane — dispatch whenever the change is user-facing
Judge the **experience**, not just the mechanics — grounded in established usability heuristics. Framework- and product-agnostic; where a11y / responsive / design-consistency overlap the Frontend lane, this lane judges them as *experience quality*, not as a checkbox.

- **System status & feedback** — every action is acknowledged within ~100ms; the user always knows what's happening (in progress / done / failed / disabled-and-why); no silent operations; long work shows real progress and stays cancelable; perceived latency is managed (optimistic UI / skeletons), never an indefinite spinner.
- **Match the user's mental model** — language, labels, and step order match how the user thinks about the task, not the system's internals; recognizable terms over jargon; the flow follows the expected real-world sequence.
- **User control & freedom** — clear exits, back, cancel, and undo; no dead-ends or traps; destructive / irreversible actions are confirmed or reversible; the user can always get out of where they are.
- **Error prevention over error messages** — make mistakes hard to commit: constrain and validate input at the point of entry, sensible defaults, guard rails, confirmation on destructive actions — prevent the error rather than explain it afterward.
- **Error recovery** — when something fails, the message is plain-language, says what went wrong **and how to fix it** (no codes / jargon), offers a recovery path, and **preserves the user's work** (never clears the form / draft on failure).
- **Recognition over recall** — surface options, context, and prior input so the user need not remember; visible affordances; never ask for what the system already knows; defaults and recently-used.
- **Cognitive load & flow** — the primary task is achievable in the fewest steps; the happy path is obvious and fast; progressive disclosure hides advanced / rare options; **one clear primary action** per screen; related actions grouped.
- **Forgiveness / data safety** — in-progress input is preserved across navigation, refresh, and errors (autosave / draft); confirm before discarding work; provide undo for destructive operations; no accidental data loss.
- **Empty / first-run states teach** — an empty or first-use state guides the next action (not a blank void); onboarding for non-obvious features; contextual help where needed.
- **Microcopy** — labels, buttons, and messages are specific and action-oriented; a control says exactly what it will do and the confirmation says exactly what happened; write from the user's side, not the system's.
- **Visual hierarchy serves usability** — layout leads the eye to the primary action; spacing has rhythm (no cramped groups or dead zones); repeated rows align in clean vertical lanes; type hierarchy and restraint keep everything readable at a glance; color is used sparingly for meaning, not decoration.
- **Efficiency for repeat users** — accelerators (keyboard shortcuts, bulk actions, sensible defaults) that speed frequent users without confusing new ones.
- **Accessibility & responsive as experience** — fully operable by keyboard and screen reader, adequate touch targets, motion-safe; the task is completable across viewports and devices with every critical action reachable and no horizontal scrolling.
- **Forms & input UX** — correct input types / `inputmode` / `autocomplete` tokens (the right mobile keyboard, password-manager and autofill friendly); humane validation timing (validate on blur / submit, never shout errors mid-typing or before first interaction); required vs optional is obvious; format hints, examples, and sensible constraints prevent mistakes before they happen.
- **Motion & transitions** — animation is purposeful (guides attention, shows what changed or where it went), never decorative filler; state changes are **perceivable**, not abrupt; timing and easing feel right and never block the user; all of it collapses cleanly under reduced-motion.

### Real-browser gate — mandatory whenever the Frontend or UX lane runs
Reading the code and passing component tests is **not** a UI review. Whenever the diff touches UI, the screen is **opened in real Chrome through Playwright and looked at**, every cycle, on the exact branch state being judged. A headless DOM has no layout, no real focus, no transitions and no container queries, so it cannot see the defects this gate exists for.

- **Run it, don't describe it.** The controller (or one dedicated reviewer) writes a check script and executes it; "needs a browser check" is not an acceptable finding or verdict.
- **What it must cover:** the screen at desktop, laptop and phone widths (1440 / 1100 / 375 / 320) with **no sideways scroll — measured on the document AND inside every scroll area**; realistic long content (long names, many rows, empty, error); every control reached and operated **with real key presses** (Tab, Enter, Escape) including what opens, where focus lands, and where it returns; accessible names of icon-only controls; both themes when the screen supports them; no page errors.
- **Look at the screenshots.** Take them and read them — a passing assertion on the wrong page proves nothing.
- **Evidence comes from the tree that will merge.** Serve the branch under review on its own port and confirm the page really is that tree (another session may already be serving a different one on the default port). A result from another branch, or from a file copied across, does not count.
- **No real data.** Answer the API in the script (`page.route`) or use a test site; never a production or shared site.
- **How:** the Playwright *library* with `chromium.launch({ channel: "chrome" })`. For the Jarvis SPAs use `tools/ui-browser-check/` from the claude-tool repo (`run.sh <frontend-dir> <check.mjs>`, `example.mjs`, README; local copy at `~/review/tools/ui-browser-check/`).
- **Coverage gate:** a UI diff with no executed browser run this cycle = the Frontend and UX lanes are **not covered = not green**. Any change after the last run makes it stale; run it again.

### Deployment, rollout & migration lane — dispatch whenever the diff touches migrations, data patches, feature flags, config, dependencies, or infra
A dedicated reviewer covering, exhaustively. Framework-agnostic:

- **Schema & data migrations** — reversible (or a documented forward-only rationale); a data patch is **idempotent** (safe to re-run), **correctly ordered** (runs after the field / doctype it reads exists), and lives in the right app; **tested against a realistic populated dataset**, not just an empty one (empty tables always "migrate" cleanly even when the change is invalid); no mandatory field added to existing rows without a backfill; a field-type change ships a conversion patch.
- **Backfills at scale** — bounded / batched (won't lock a large table or blow memory); resumable; safe to run while the app serves traffic.
- **Feature flags & kill switches** — the default is safe; there is a rollback rung (disable / drain, not just on↔off); the flag's authoritative read is race-free; a self-host / special-mode guard where relevant.
- **Rollout & deploy ordering** — cross-repo / cross-service ordering is explicit (what must ship first so the other side has what it reads); old and new code coexist across the deploy window (backward- and forward-compatible); zero-downtime; a clear rollback path.
- **Dependencies / supply chain** — a new dependency is justified and vetted (license, maintenance, size, known CVEs); the lockfile change is intentional and minimal; no unpinned or surprise transitive bumps; a private / internal dep reaches every environment that needs it.
- **Config & secrets** — new config / env vars are documented with safe defaults; secrets go through the proper store, never plaintext or logs; nothing environment-specific is hardcoded.

## Model assignment (cost-aware)
Use the **least-capable model that does the lane well** — don't pay Opus/Fable rates for a lane a cheaper model nails. The **controller** (main loop) does scouting, aggregation, adjudication, and the coverage gate at no extra agent cost.

- **opus** — deepest reasoning, highest cost; reserve for the subtle, high-consequence lanes.
- **sonnet** — the **default** workhorse.
- **haiku** — fast & cheap: mechanical lanes + bookkeeping.
- **fable** — expensive; **never per-lane**. Reserve for a single **optional** high-stakes tie-break / independent second opinion on a *Critical* correctness / security / resilience finding, where its specialization earns the cost.

| Lane | Model |
|---|---|
| Correctness & stability | **opus** |
| Security & data handling | **opus** |
| Performance & concurrency | **opus** |
| Resilience & failure modes (code + flow + mechanisms) | **opus** |
| Approach & simplification (surfaced, not gated) | **opus** |
| Edge cases & gaps | sonnet |
| Testing & test quality | sonnet |
| Operability & observability | sonnet |
| Frontend · UX & usability · chat-safety | sonnet |
| Deployment, rollout & migration | sonnet → **opus** if a data migration / backfill is in the diff |
| Maintainability: readability / DRY / API | **haiku** → sonnet if a public API / contract changes |
| Completeness critic | **haiku** |
| Adversarial verify of a *Critical* finding (optional) | **fable** or opus |

## 4. Loop to a coverage-gated green
- Aggregate all lane findings → **one fix wave** for every Critical/Important across all lanes.
- **Two buckets, not one.** Defects → the fix wave. A **materially better approach** the review surfaced does **not** enter the fix wave and does **not** block the green — collect it and **raise it with the user to discuss (§5)**; the current approach may be perfectly correct even when a better one exists, and adopting the alternative is the user's decision, never a silent rewrite.
- Re-dispatch the **full panel** (fresh reviewers) next cycle. Findings should **narrow each cycle** (converging).
- **Coverage gate:** declare GREEN only when **every floor lane returned an explicit verdict** (`CONFIRMED-clean | findings[]`). A lane that never reported = not covered = **not green** (visibly missing, never silently skipped).
- Optional last step: a **completeness critic** — "which Phase-1 concern was named but not genuinely exercised?"

## 5. Report
Present findings **most-severe-first** with `file:line`, the concrete failure scenario, and the fix. State the final verdict and confirm each lane is green.

Then, as a **distinct section — "Alternatives to discuss"** — list any **materially better approach** the review surfaced: the current approach, the alternative, the concrete tradeoff (reliability / simplicity / cost / effort), and a recommendation. **Pause and discuss these with the user before finalizing** — they are decisions to make together, never adopted or dropped unilaterally. (Empty section when the review found none — say so, don't omit it.)

## Guardrails
- **Consequence order for the fix decision:** correctness → security → perf → concurrency → readability/DRY. Readability/DRY are usually **Minor** (don't block) unless DRY is duplicated **logic** / forked implementations → **Important**.
- Tests run **only on test sites**, never real/prod sites.
- **UI is verified in real Chrome through Playwright, not by reading.** A UI diff is never GREEN on code reading and component tests alone (see **Real-browser gate**).
- Keep design/plan docs out of any commit.
- **Don't merge** — surface the verdict and hand it back; the user merges.
- **A better approach is raised, not imposed.** When the review finds a materially better / more reliable way, surface it and **discuss with the user** — never silently rewrite to it, never silently bury it. It informs a decision; on its own it does not block the merge.
