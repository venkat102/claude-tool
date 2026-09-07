---
description: Jarvis release-notes generator — turn a set of merged jarvis-app PRs into customer-facing, grouped release notes (New / Improvements / Fixes / Action needed) ready to paste into a Jarvis Changelog. User-facing only; internal changes are dropped.
argument-hint: "<pr refs — numbers or URLs, comma- or newline-separated> (jarvis app PRs)"
---

# /release-notes — Jarvis customer release-notes generator

Turn the merged PRs that make up a Jarvis **app** release into **customer-facing** release notes: grouped, in plain benefit-first language, ready to paste straight into the **Release notes (Markdown)** field of a `Jarvis Changelog` (App Releases → Create Release). It reads the PRs you name, keeps only what a **customer can see or do** in their Jarvis, drops the internal plumbing, and never invents anything.

This is a **local, manual** tool. The LLM is the Claude session you are running it in — there is no service to call and no key to configure. You run it, review the draft, and publish by hand. It is **read-only**: the only command it runs is `gh pr view`.

## Input

`$ARGUMENTS` is one or more **jarvis-app** PR references, comma- or newline-separated. Accept:
- bare numbers (e.g. `1150, 1154`) → resolve to `Aerele-RnD/jarvis`,
- full URLs (e.g. `https://github.com/Aerele-RnD/jarvis/pull/1150`).

If `$ARGUMENTS` is empty, ask which PRs to include and stop — never guess a PR set.

## Step 1 — fetch each PR (read-only)

For each ref, run:

```
gh pr view <number> --repo Aerele-RnD/jarvis --json number,title,body,labels,state,mergedAt,url
```

- A ref that does not exist, is **not merged**, or is not on `Aerele-RnD/jarvis` → **flag it explicitly** at the top of the output ("⚠️ skipped: #1234 not merged") and continue. Never drop a bad ref silently.
- If `gh` returns an auth error (403), stop and say: "gh needs read access to `Aerele-RnD/jarvis` — authenticate that scope and re-run." (This tool depends on your gh auth reaching the jarvis org.)
- Read the **title + body + labels** only. Do NOT pull the diff — titles and descriptions are enough and keep it fast.

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

A change is **user-facing** if a customer would notice it in any of the above: a new capability, a better/faster/clearer experience, a bug they were hitting now fixed, or something they must now do.

**Drop as internal** (do NOT put these in customer notes) anything a customer cannot see:
- fleet / control-plane / provisioning / container / host / cell / billing-ops / operator-console changes,
- fleet-agent, openclaw image, plugin infrastructure, persona internals,
- CI, tests, refactors, dependency bumps, lint, formatting, type-only changes,
- version backports (`backport/...-version-15/16`) — the original feature PR is the note, not its backport,
- **dark-shipped** work: a feature merged behind a default-off flag that is **not yet live** for customers. Omit it until the release actually turns it on. If unsure whether a release activates it, leave it out and mention it in the omitted list.

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

## Step 4 — output

Print, in a single fenced block the operator can copy verbatim into the **Release notes (Markdown)** field, the grouped sections (empty groups omitted). Then, **below the block** (not inside it), print a short accounting so nothing is invisible:

```
_(omitted N internal PRs: #1149 CI fix, #1152 test-only, #1148 backport, #1155 dark-shipped)_
_(skipped M bad refs: #9999 not merged)_
```

The accounting is for the operator's eyes only — it is NOT part of the pasteable notes.

## Guardrails
- **Read-only.** Only `gh pr view`. Never edit, publish, or call any Jarvis / control-plane endpoint — the operator reviews the draft and publishes by hand.
- **Draft, not truth.** This produces a first draft for a human to edit. Prefer omitting over guessing.
- **Scope = the jarvis app only.** Other repos (control plane, fleet-agent, plugin, persona) are operator-internal and out of the customer changelog.
