---
name: ct-pr-description
description: Write the pull-request description for a change that already has a GREEN review verdict and a GREEN flow verdict, in five fixed sections.
---

# Evidence-backed PR description (the last step)

Write the PR description only for a change that the pipeline already passed:
`$ct-review-loop` GREEN, then this skill (gate, write, print, confirm), then
`gh pr create` or `gh pr edit`. Use only evidence that exists; never invent any.
Explicit user instructions and higher-priority instructions take precedence.
State the risk tier early. The gate applies at every tier; the tier scales only
the depth of the caller and flow search.

## 1. Resolve the target

Pick `<remote>` first from the repo (it can be `upstream`, not `origin`). Run
`git fetch <remote>`. Use `<remote>/<base>` as the base, never a stale local branch.

- A base branch name: diff against it. A PR number: update that PR. Run
  `gh pr view <n> --json baseRefName,headRefName,headRefOid`. The current branch
  must equal `headRefName` and `git rev-parse HEAD` must equal `headRefOid`. On a
  mismatch, use the worktree that holds the branch or ask.
- A ticket ref (`ABC-123`, an issue URL): name the issue in Issue Description.
- Empty: the open PR's base, else the trunk (`develop`, `main` or `master`).
- Trailing text is extra focus.

For a ticket ref or an empty target, check the branch identity too: the current
branch must be the branch that holds the change. If it is unclear, ask.

State the base. If it is unclear, ask. Read verdicts and plan from the worktree
that holds the branch you describe.

Define `<slug>`: the branch name with `/` replaced by `-`. All work files go in
`.claude/workflow/pr-assets/<slug>/`. Before you write there, get the exclude file
with `git rev-parse --git-path info/exclude` (in a worktree `.git` is a file). If
`git check-ignore -q <path>` fails, append the path to that file and confirm with
`git check-ignore`. Never edit `.gitignore`.

## 2. The gate: no description unless the pipeline is green

Run it before anything is written. If a check fails, stop, name the gate, write nothing.

- Change set: `git diff --name-status <remote>/<base>...HEAD`, plus uncommitted
  tracked changes (`git diff --name-status HEAD`), plus untracked files outside
  `.claude/` (`git ls-files --others --exclude-standard`).
- Code gate: `.claude/workflow/reviews/latest-code.md` has the exact first line
  `VERDICT: GREEN` and names the review (cycle, reviewer, dimensions) from
  `$ct-review-loop`. If it does not name them, ask the owner; do not assume.
  `VERDICT: RED` always blocks. An author-written verdict does not pass. A
  disclosed single-agent review passes only if the reviewer is not the author of
  the change (a separate session or agent). A self-review by the author does not
  pass. Both rules have one exception: the owner may accept the disclosed
  single-agent review in the session, in words that name the single-agent review.
  The section 7 confirmation of the description or a bare "go ahead" is not an
  acceptance. Read the quote in `latest-code.md` (`$ct-review-loop` puts it there)
  and quote it in Impact Analysis. If this is unclear, ask the owner.
- Flow gate: `.claude/workflow/reviews/latest-flow.md` must exist, for every
  change. Its first line is exactly `VERDICT: GREEN`, or starts with
  `VERDICT: GREEN — ` or `VERDICT: GREEN - ` (so `VERDICT: GREENISH` fails). It must
  come from an executed flow review of the final state. An executed GREEN flow
  review passes the gate for any change, backend-only included, browser or not.
  A first line whose suffix says the flow did not run (N/A, skipped, not run)
  counts as the N/A form. The N/A form passes only for documentation-only changes,
  and the file then reads `VERDICT: GREEN — N/A: documentation only …`. A missing
  file blocks. Stop and ask when no executed flow review exists.
  `VERDICT: RED` always blocks.
- Documentation only: every file in the change set ends in `.md`, `.rst`, `.txt`
  or `.adoc` (agent prompt Markdown such as `SKILL.md`, `AGENTS.md` and
  `commands/*.md` counts only when the repo has no app or build to run), and none
  is a dependency, build or config file (`requirements*.txt`, `CMakeLists.txt`,
  `*.lock`, CI paths such as `.github/`). A dev harness under `tools/` does not
  count as an app or build. Any code, config, script, dependency, CI, template or
  data file means not documentation only. The owner's explicit classification
  settles a doubt. Then the PR says "documentation only — no flow review, nothing
  to run" (prompt files: "documentation only (agent prompt files) — no flow
  review, nothing to run"). If unsure, ask.
- Diff hash: for a committed change set use `git diff <remote>/<base>...HEAD | sha256sum`.
  For an uncommitted review, first run `git add -N <untracked change-set files outside .claude/>`,
  then run `git diff <remote>/<base> | sha256sum` (working tree including staged).
  A verdict records one of these hashes with its scope.
- Staleness: a verdict is stale when a change-set file has an mtime newer than
  the verdict, or when it names a base or branch that differs from the change set
  (a base that moved by SHA only is not "a base that differs"),
  or when its recorded diff hash differs from the recomputed hash. A recorded `HEAD`
  that is an ancestor of the current `HEAD` with an unchanged diff hash is NOT
  stale. A recorded `HEAD` that is NOT an ancestor of the current `HEAD`, with no
  recorded hash, is stale (or ask). A moved base with an unchanged 3-dot diff is
  not stale. For a committed
  delete or rename, the commit time is not a signal (a commit after the verdict is
  normal): judge it by the diff hash, and if no hash is recorded, ask. An
  uncommitted deletion or rename is stale. After a rebase or fresh checkout,
  the answer to a stale verdict is a re-review, not an override. A stale verdict blocks.
- Cannot decide: stop and ask. Never assume fresh.

At gate 1, write the record to `.claude/workflow/pr-assets/<slug>/gate.md`: the
`HEAD` SHA, the change-set list, the diff hash, and the mtime and first line of both
verdict files. Gate 2 (section 7) reads that file and compares all of it; any
difference blocks.

## 3. Gather the context (search, never memory)

Read `git diff <remote>/<base>...HEAD`, `git log <remote>/<base>..HEAD`, the approved
plan and its acceptance criteria, both verdicts with their cycle counts, and the
ticket the owner names. Read `.claude/workflow/reviews/latest-test-audit.md` when
it exists. Find every file, function, API and user flow the change touches with
search and the code. T0/T1: inline caller search. T2/T3: one explorer per
subsystem, at most 4 (explorers may be grouped), only when delegation is
authorized. The cycle count may come from the implement notes or from the
`cycle*` copies of the review files, when the verdict does not state it.

## 4. Write five sections: exact headings, exact order, none skipped or merged

Use level `###` and copy the text exactly:

- `### Issue Description`: what was broken or missing, who it affected, why it matters, the ticket ID.
- `### Steps to Reproduce`: numbered steps on the base branch: environment, preconditions, data, expected and actual result. For a new feature, the steps may show the missing behaviour on the base branch.
- `### Solution Provided`: what changed and why, each file or module with a one-line reason, alternatives if the plan records them.
- `### Impact Analysis – Proof That Existing Flows Are Not Affected` (en dash `–`): each existing flow touching the changed code and how it was verified (unit, integration, real-browser check, or unaffected by design with the reason); each acceptance criterion mapped to evidence; both verdicts quoted with the cycle count ("cycles: not recorded" if absent); the `latest-test-audit.md` result quoted when present (evidence, not a gate); the test commands and results (when this skill runs no test, quote the results from the verdict files and name the file); risk tier, remaining risk, rollback. State anything unverified as unverified.
- `### Before and After Screenshots`: table `Scenario | Before | After`, one row per affected screen or state. No UI: "N/A – no UI changes", plus before/after logs, API responses or CLI output.

## 5. Language: ASD-STE100 Simplified Technical English

Procedural sentences: 20 words maximum, one imperative instruction each.
Descriptive sentences: 25 words maximum, one topic each. Paragraphs: six
sentences maximum. Use active voice and the simple present, past and future only.
No "-ing" forms as verbs or nouns, except in technical names. One word has one
meaning. Avoid phrasal verbs and noun clusters of more than three words. Use
articles. Use vertical lists for sequences and for more than two related items.
Warnings stand alone before the step and start with `WARNING:` or `CAUTION:`.
Technical names stay exact, in backticks. Before output, check every sentence for
word count, passive voice and more than one instruction; fix, then print. Conflict
rule: if an STE rule conflicts with the section structure, keep the section names
and order, and apply STE inside them.

## 6. Screenshots (strict)

- Never commit them. Store them in `.claude/workflow/pr-assets/<slug>/{before,after}/`
  (the slug and the exclude step are in section 1). Create the folders only when
  there are screenshots.
- After: run the flow review's check script on the final state, or copy the flow
  review's screenshots of that state. Before: run it on the base in a temporary
  `git worktree add`, then remove the worktree. A screen that is new says so.
- A placeholder may name only a file on disk. List the exact local paths below the
  table. A cell without a screenshot says "unverified — no screenshot (<reason>)";
  Impact Analysis states it. A UI change with no check script: stop and ask.
- Image check, before you finish: only images the change set adds, stages or
  leaves untracked count. Extensions: png, jpg, jpeg, gif, webp. Match the
  extension with no regard to case (`.PNG` counts). Run these commands:
  - `git diff --diff-filter=A --name-only <remote>/<base>...HEAD`
  - `git log --diff-filter=A --name-only --format= <remote>/<base>..HEAD`
  - `git diff --cached --diff-filter=A --name-only`
  - `git diff --diff-filter=A --name-only <remote>/<base>` (working tree against
    the base; it also lists a new file after `git add -N`)
  - `git ls-files --others --exclude-standard`
- "Already tracked" always means tracked in `<remote>/<base>`. Do not flag such an
  image. A rename (`R`) of such an image is not a match. An image that a commit
  of the branch added is not already tracked, even though it is tracked at `HEAD`.
- The `git log` command finds an image that a commit added and a later commit
  deleted. That image stays in the history, so it counts as committed.
- The `.claude/` exclusion applies only to the untracked check. Ignore untracked
  paths under `.claude/`.
- A committed match: STOP. Do not create or edit the PR until the owner removes
  the image from the commits.
- A staged match: unstage it (`git restore --staged <path>`). Then ask the owner to
  move the file or ignore it. The file is now untracked, so the untracked rule
  applies and the check keeps blocking.
- An untracked match outside `.claude/`: ask the owner to move the file or ignore it.
  The check keeps blocking until the owner does so.
- Exception: the owner may state in the session that an added image is a product
  asset (an icon or a logo), not a screenshot. Quote those words in Impact
  Analysis. That image is not a match and does not stop the PR.

## 7. Output

1. Print the description in Markdown first. Do not create or update the PR yet.
2. After the owner explicitly confirms, run `git fetch <remote>`. Then run both
   gates again (staleness included) against the gate 1 record, and run the image
   check of section 6 again. If `gate.md` is missing, stop and run gate 1 again.
   A new commit, an edited file, a RED or stale verdict, or an image match blocks:
   name the gate that failed. For `gh pr edit`, read `headRefOid` again with
   `gh pr view` at this step. It must equal local `HEAD`.
3. Run `git fetch <remote>`. Local `HEAD` must equal `<remote>/<branch>`; otherwise
   stop and tell the owner to push or reconcile.
4. Write the body to `.claude/workflow/pr-assets/<slug>/pr-body.md`, then run
   `gh pr create --body-file <that file>` or `gh pr edit --body-file <that file>`.
   For `gh pr edit`, read `headRefOid` again right before the edit. It must equal
   local `HEAD`. Add no attribution of your own; project and owner rules apply.

Never invent a test result, flow, verdict, number or screenshot. Keep the five
headings and their order, always.

## Codex execution

Use the session model, targeting `gpt-6-astra`. Run browser checks with the tools
available; when the repo has `tools/ui-browser-check/`, use Playwright through it
with `SHOTS=<absolute assets dir>/after sh tools/ui-browser-check/run.sh <frontend-dir> <check.mjs>`
(and `/before` for the base). Delegate only when explicitly authorized and
supported, inheriting the selected model. Otherwise do the work as one agent and
disclose that it was a single-agent run.
