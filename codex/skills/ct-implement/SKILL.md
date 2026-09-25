---
name: ct-implement
description: Implement an authorized feature or fix against acceptance criteria, with scoped verification and review.
---

# Criteria-driven implementation

Resolve the requested change and acceptance criteria from the conversation or
provided plan. For straightforward work, state concise criteria and proceed.
For a material unresolved design decision, investigate first and ask only for the
missing decision. Explicit user instructions and higher-priority instructions take
precedence; existing authorization persists.

## Build

1. Read repository guidance, status, relevant code and existing tests. Preserve
   unrelated work. Use the user's designated branch/worktree; otherwise use an
   isolated feature branch as appropriate. Never reset work or rebase a dirty
   checkout just to obtain a fresh trunk.
2. Extend existing mechanisms in small testable units. Carry relevant permission,
   concurrency, partial-failure, retry, and observability requirements into the code.
   Keep each change tied to the intended behavior and avoid unrelated redesign.
3. Add regression tests for changed behavior where they provide meaningful evidence.
   A failing test first is useful for a reproducible defect. Documentation-only or
   low-impact mechanical work does not require artificial tests or mutation testing.
4. Run appropriate tests/builds and inspect the actual output, not only the exit
   status. Use dedicated disposable test sites for mutating ERP tests. Never infer
   production safety from a mocked unit suite.
5. Review the diff against the criteria, including all callers and affected user
   surfaces. Verify proposed review fixes before applying them. Test non-obvious
   guards adversarially when the risk justifies it; do not repeatedly run unaffected
   suites once the relevant checks pass.

If failures persist, investigate their cause rather than accumulating speculative
patches. If the plan is contradicted by evidence, explain the smallest necessary
change and continue unaffected authorized work. Maintain durable progress notes
for long tasks in a location permitted by the repository.

## Completion and handoff

Report the resulting behavior, evidence, and remaining limitations. Label tests
not run and distinguish blockers from optional improvements. Commit, push, open
PRs, publish, or merge only when authorized by the task and applicable rules.
When a full build/review workflow is requested, continue through scoped review and
fixes; do not stop at a proposed plan or ask again for already-authorized steps.

## Codex execution

Use available shell/edit/test tools and the selected session model, targeting
`gpt-6-astra`. No other skill or specific tool name is required. Do not spawn
subagents unless explicitly authorized and supported. When used, inherit the
selected model and partition files/tasks; otherwise perform a labeled self-review.
