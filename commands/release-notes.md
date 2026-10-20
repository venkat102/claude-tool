---
description: Jarvis release-notes generator — turn a set of merged PRs from any Jarvis repo (app, control plane, fleet-agent, plugin, persona, helpdesk), or whole release PRs, into customer-facing, grouped release notes (New / Improvements / Fixes / Action needed) ready to paste into a Jarvis Changelog. User-facing only; internal changes are dropped.
argument-hint: "<pr refs — numbers, repo#N, URLs, or release PRs; comma- or newline-separated>"
---

# /release-notes — Jarvis customer release-notes generator

Turn the merged PRs that make up a Jarvis release into **customer-facing** release notes: grouped, in plain benefit-first language, ready to paste straight into the **Release notes (Markdown)** field of a `Jarvis Changelog` (App Releases → Create Release). It reads the PRs you name **from every Jarvis repo**, keeps only what a **customer can see or do** in their Jarvis, drops the internal plumbing, and never invents anything.

This is a **local, manual** tool. The LLM is the Claude session you are running it in — there is no service to call and no key to configure. You run it, review the draft, and publish by hand. It is **read-only**: the only command it runs is `gh pr view`.

## Input

`$ARGUMENTS` is one or more PR references, comma- or newline-separated, from any of these repos:

| Short name | Repo | What it is |
|---|---|---|
| `jarvis` (default) | `Aerele-RnD/jarvis` | The customer app: chat, tools, cards, settings |
| `admin` | `Aerele-RnD/jarvis-admin-v2` | Control plane: signup, plans and billing, support, announcements, fleet ops |
| `fleet` | `Aerele-RnD/jarvis-fleet-agent` | Per-host container executor |
| `plugin` | `Aerele-RnD/jarvis-openclaw-plugin` | Registers the tools the agent can call |
| `persona` | `Aerele-RnD/jarvis-persona` | How Jarvis talks, its skills and tool guidance |
| `helpdesk` | `Aerele-RnD/jarvis-helpdesk` | Customer support tickets |

Accept:
- bare numbers (e.g. `1150, 1154`) → `Aerele-RnD/jarvis`,
- `<short-or-repo-name>#<n>` (e.g. `admin#751`, `jarvis-persona#274`),
- full URLs (e.g. `https://github.com/Aerele-RnD/jarvis-fleet-agent/pull/327`),
- free text that names release PRs (e.g. "the v1.5.0 release PRs in all repos") → resolve it to concrete refs and **list the refs you resolved** at the top of the output before using them.

If `$ARGUMENTS` names no PRs and no release, ask which PRs to include and stop — never guess a PR set.

## Step 1 — fetch each PR (read-only)

For each ref, run:

```
gh pr view <number> --repo <owner/repo> --json number,title,body,labels,state,mergedAt,baseRefName,headRefName,url
```

- **Release PR → expand it.** A release PR (`develop → main`, or `version-N-hotfix → version-N`) carries an `### Included (N)` list of `#<n>` lines in its body. Take those numbers (same repo) as the real input; the release PR itself is not a note. It may still be open; its included PRs must be merged.
- **Backport → its original.** A PR whose title ends `(backport #<n>)` (one or more numbers) or whose head is `backport/...` / `mergify/bp/...` is a copy. Fetch the original `#<n>` in the same repo and write the note from it. When the v15 and v16 lines carry different sets, note the difference in the accounting below the block.
- A ref that does not exist, is **not merged**, or is not in one of the repos above → **flag it explicitly** at the top of the output ("⚠️ skipped: admin#1234 not merged") and continue. Never drop a bad ref silently.
- If `gh` returns an auth error (403/404 on a repo you expect), stop and say which repo: "gh needs read access to `<owner/repo>` — authenticate that scope and re-run."
- Read the **title + body + labels** only. Do NOT pull the diff — titles and descriptions are enough and keep it fast. With many PRs, fetch them in parallel batches.

## Step 2 — understand what Jarvis is (so you can judge user-facing vs internal)

Jarvis is an **AI teammate for ERP**, delivered to customers as a chat experience over their own Frappe/ERPNext bench. What a **customer** actually sees and uses:

- **Chat** with Jarvis in plain language — the web app at `/jarvis`, the Desk chat bubble, and the mobile/PWA. Conversation memory across a chat.
- **Doing ERP work by asking** — the tool layer: looking up records, running and preparing reports, creating and editing documents (invoices, orders, etc.), bulk actions, importing data, and **exporting** results (PDF, Excel, charts).
- **Confirmation cards / receipts** — Jarvis asks before it writes, and shows a durable receipt of what it did (confirm / discard / failed).
- **Skills & macros** — custom and learned skills, "approve & run" macros that let a saved workflow run its covered steps with one approval.
- **File Box** — drop a file in and Jarvis extracts / does data entry from it (OCR).
- **Web** — Jarvis can search and fetch from the web when asked.
- **Voice** — speaking to Jarvis (speech-to-text).
- **Update nudges** — the in-chat "a new version is available" pill / banner / What's-new panel, and the release email (this very changelog).
- **Settings** — the Jarvis Settings screen a customer configures.
- **Account** — signing up, onboarding their site, plans, billing and invoices, announcements, and support tickets.

A change is **user-facing** if a customer would notice it in any of the above: a new capability, a better/faster/clearer experience, a bug they were hitting now fixed, or something they must now do.

**Judge by what the customer sees, not by which repo the PR is in.** Every repo can carry user-facing changes:

- **jarvis** — most notes come from here.
- **admin** — keep signup and onboarding, plans and billing the customer sees, invoices, announcements, support, and anything that changes which tools or limits a customer's plan gets. Drop the operator console, fleet, hosts, cells, publish and roll pipelines.
- **fleet** — usually internal. Keep it only when the customer feels it: something they could not do before now works (for example onboarding a site on a private network), or a reliability problem they were hitting stops.
- **plugin** — a newly exposed tool means "Jarvis can now do X". Keep the capability, drop the plumbing.
- **persona** — keep behaviour a customer notices in replies (Jarvis now explains, cites, checks or says something it did not before). Drop gate scripts, lint, drift checks, contract re-vendoring.
- **helpdesk** — keep changes to the support-ticket experience.

**One feature, one bullet.** A single capability often spans repos (the app adds a tool, the plugin exposes it, the persona teaches it, the control plane adds it to a plan). Merge those into one bullet and list all the PRs it came from in the accounting.

**Drop as internal** (do NOT put these in customer notes) anything a customer cannot see:
- fleet / control-plane / provisioning / container / host / cell / billing-ops / operator-console changes,
- container images, plugin wiring, persona gates and tooling,
- CI, tests, refactors, dependency bumps, lint, formatting, type-only changes, docs for engineers,
- version backports — the original PR is the note, not its backport (Step 1 resolves them),
- **dark-shipped** work: a feature merged behind a default-off flag, or marked "merged now, deployed later" / HELD, that is **not yet live** for customers. Omit it until the release actually turns it on. If unsure whether a release activates it, leave it out and mention it in the omitted list.

When a PR is genuinely mixed (a customer-facing change plus internal cleanup), keep only the customer-facing half and phrase it from the customer's side.

## Step 3 — write the notes

Group the surviving PRs under only the headings that have content:

```
### ✨ New
### ⚡ Improvements
### 🐛 Fixes
### ⚠️ Action needed
```

- **✨ New** — capabilities the customer did not have before.
- **⚡ Improvements** — existing things now faster / clearer / more capable.
- **🐛 Fixes** — bugs the customer was hitting, now resolved.
- **⚠️ Action needed** — anything the customer or their admin must *do*: update to get a capability, a changed default, a new setting, a breaking change. Be specific about the action.

Writing rules:
- **Customer voice, benefit-first.** Translate the engineering ("refactor `_status_from_ctx`") into what the customer gets ("the update banner now shows how far behind you are"). One line per item; lead with the value, not the mechanism.
- **No jargon, no PR numbers, no internal names** (no doctype names, function names, repo names, ticket ids) in the notes themselves.
- **No em-dashes** anywhere (Jarvis house style). Use a comma, a full stop, or "and". This is a hard rule — these notes render in the customer's What's-new panel and email.
- **Never invent.** If a PR's title/body does not make its customer impact clear, put it in the omitted list with "unclear customer impact" rather than guessing a benefit.
- Keep the whole thing scannable: short bullets, no preamble, no closing line, no title heading (the version and title are separate fields in Create Release).
- Within a group, put the changes most customers will notice first.

## Step 4 — output

Print, in a single fenced block the operator can copy verbatim into the **Release notes (Markdown)** field, the grouped sections (empty groups omitted). Then, **below the block** (not inside it), print a short accounting so nothing is invisible, with every PR named as `repo#n`:

```
_(sources: jarvis#2089 + plugin#126 + persona#275 → "share chats"; ...)_
_(omitted N internal PRs: admin#721 fleet ops, fleet#323 perf internal, persona#263 gate, jarvis#2045 CI, admin#717 dark-shipped)_
_(skipped M bad refs: jarvis#9999 not merged)_
_(line differences: v15 lacks jarvis#2089 until its backport merges)_
```

The accounting is for the operator's eyes only — it is NOT part of the pasteable notes.

## Guardrails
- **Read-only.** Only `gh pr view`. Never edit, publish, or call any Jarvis / control-plane endpoint — the operator reviews the draft and publishes by hand.
- **Draft, not truth.** This produces a first draft for a human to edit. Prefer omitting over guessing.
- **Scope = what customers see, from any Jarvis repo.** Third-party code (frappe, erpnext, hrms, vendored helpdesk/telephony, openclaw upstream) is never a source.
