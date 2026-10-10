# claude-tool

Custom [Claude Code](https://claude.com/claude-code) slash commands for a **risk-tiered, evidence-first development cycle**.

Install by copying the files in [`commands/`](./commands) into `~/.claude/commands/`.

## The cycle

```
/architect     → generate  — evidence-first, diverge-wide/converge-precise solution + plan
/plan-check    → front gate — pressure-test the plan against every quality dimension
/implement     → middle gate — build to the acceptance criteria (TDD + per-task review)
/review-loop   → back gate  — multi-dimension eight-lane-floor review, looped to green
/wear-the-coat → user axis  — persona-driven lived-experience audit of a flow
```

**Generator → critic → builder → verifier.** The acceptance criteria are the through-line: `/plan-check` emits them, `/implement` builds to them, `/review-loop` verifies against them. `/architect` never grades its own plan — it hands to `/plan-check`.

Every command **scales to a risk tier** (T0 trivial → T3 high-stakes), classified by blast radius × reversibility, so cost matches the stakes.

## Commands

| Command | Role |
|---|---|
| `architect` | Evidence-first solution architect — explore (codebase + web) → all viable solutions with proof → agree → plan. |
| `plan-check` | Planning pressure-test — stress a plan/spec/approach against every dimension *before* code. |
| `implement` | Build to the criteria with the quality dimensions as live guardrails. |
| `review-loop` | Multi-dimension Phase-1-floor review loop with a coverage gate. |
| `wear-the-coat` | Wear a profession's coat and audit a flow's lived experience. |

## UI is verified in a real browser

Whenever a change touches UI, the cycle requires it to be **opened in real Chrome through
Playwright and looked at**; code reading and component tests are not enough. `architect` and
`plan-check` put the browser check in the acceptance criteria, `implement` runs it before
claiming done, `review-loop` gates the green on it (its **Real-browser gate**), and
`wear-the-coat` runs its click-tests instead of only listing them.

[`tools/ui-browser-check/`](./tools/ui-browser-check) is the runner used for the Jarvis SPAs:
it serves a checkout or git worktree on its own port and runs one Playwright check script
against it, with the API answered in the script. See its README.

## Project tools

Project-specific commands (not part of the generic cycle above):

| Command | Role |
|---|---|
| `release-notes` | **Jarvis** release-notes generator — turn a set of merged jarvis-app PRs into customer-facing, grouped notes (New / Improvements / Fixes / Action needed) ready to paste into a Jarvis Changelog. User-facing only; internal changes dropped. Local + manual (the LLM is your Claude session, no service to call); read-only (`gh pr view`). Needs `gh` read access to `Aerele-RnD/jarvis`. |
