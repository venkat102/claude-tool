# claude-tool

Custom [Claude Code](https://claude.com/claude-code) slash commands for a **risk-tiered, evidence-first development cycle**.

Install by copying the files in [`commands/`](./commands) into `~/.claude/commands/`.

## Codex / GPT-6 Astra

The six workflows are also available as self-contained [Codex skills](./codex/skills).
The official model identifier is `gpt-6-astra` (rather than `chatgpt-6-astra`).
Select that model in your Codex client, or start the CLI with:

```sh
codex --model gpt-6-astra
```

These are instruction-only skills, not API clients or tools for ordinary ChatGPT
without a local skill-capable environment. They use the current session and do not
set a model, change authentication, or require another API key. Access to the model
depends on your client/account. The original Claude commands remain unchanged.

Install from a stable checkout of this branch:

```sh
python3 scripts/install_codex.py --dry-run
python3 scripts/install_codex.py
```

This creates six symlinks under `~/.agents/skills`, the user-level Codex discovery
location. It refuses to replace existing directories or conflicting links and can
be rerun safely. Keep this checkout in place; edits and branch switches affect the
linked skills. To install for only one project, pass `--destination /path/to/repo/.agents/skills`.
To uninstall, remove only these six symlinks from the destination; the source stays.
If the skills do not appear after installation, restart the Codex session.

| Claude command | Codex invocation |
|---|---|
| `/architect` | `$ct-architect` |
| `/plan-check` | `$ct-plan-check` |
| `/implement` | `$ct-implement` |
| `/review-loop` | `$ct-review-loop` |
| `/wear-the-coat` | `$ct-wear-the-coat` |
| `/release-notes` | `$ct-release-notes` |

Normal automatic skill selection remains enabled. For ongoing work, select the
relevant stage rather than loading all six: architecture for design choices,
plan checking for a proposal, implementation for authorized changes, review for a
diff, persona audit for an experience question, release notes for specified PRs.
Explicit invocation is available when you want a particular workflow.

### Adaptation decisions

- Retain evidence, acceptance criteria, eight review dimensions, cross-repo user
  journeys, failure recovery, and the Jarvis release-note rules.
- Replace Claude model aliases and slash-command/tool assumptions with the current
  Codex session and available tools. Delegation is conditional on explicit authority
  and availability; there is no mandatory multi-agent panel or silent model switch.
- Remove required dependencies on unbundled skills. Each Codex skill stands alone.
- Scale review/test effort to risk. Avoid repeated approval requests, universal
  mutation tests, or endless review loops. Keep planning and report-only requests
  distinct from authorization to implement, publish, or merge.
- Keep the `ct-` prefix to avoid collisions with other installed skills.

Run installer tests with `python3 -m unittest discover -s tests -v`. Structural skill
validation and installer tests do not constitute a live model quality evaluation.
Useful manual checks: a trivial edit should not demand a review panel; a read-only
review should not edit; a migration plan should address populated data and rollback;
release notes should omit an unmerged PR and report why.

Sources checked September 25, 2026: [Astra skill guidance](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra),
[Codex skill discovery](https://learn.chatgpt.com/docs/build-skills), and
[GPT-6 Astra model identifier](https://developers.openai.com/api/docs/models/gpt-6-astra).

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

## Project tools

Project-specific commands (not part of the generic cycle above):

| Command | Role |
|---|---|
| `release-notes` | **Jarvis** release-notes generator — turn a set of merged jarvis-app PRs into customer-facing, grouped notes (New / Improvements / Fixes / Action needed) ready to paste into a Jarvis Changelog. User-facing only; internal changes dropped. Local + manual (the LLM is your Claude session, no service to call); read-only (`gh pr view`). Needs `gh` read access to `Aerele-RnD/jarvis`. |
