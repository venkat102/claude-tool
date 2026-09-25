---
name: ct-wear-the-coat
description: Audit a product journey from a specified user's professional role, including task coverage, friction, and failure recovery.
---

# Review the user's complete journey

This is a report-only experience audit unless the user also requests fixes.
Explicit user instructions and higher-priority instructions take precedence.
Resolve the flow, role, domain, responsibilities, and current job-to-be-done from
the request. If the user asks to suggest personas, propose plausible roles and let
them choose. Otherwise use a clearly stated, grounded persona when the context
establishes it; ask when the role materially changes the findings.

## Map before judging

Read the journey across every relevant surface and repository. Include the actual
diff when assessing a change. Map steps, permissions, inputs, states, outputs,
failure points and completion evidence, with file/line references. Separate what
the code proves from what needs a live interaction test.

Describe the persona's goals, workload, technical comfort and consequences of a
mistake. Do not invent needs for a profession that would not use the feature.
For each persona assess all four axes:

- Coverage: can they complete each part of the job with the available behavior?
- Gaps: what missing or broken behavior prevents or endangers completion?
- Good-to-haves: what would improve the experience without being essential?
- Failure/recovery: at each failure point, what does the system preserve or undo,
  what does the person see, and can they recover without expert intervention?

Across the axes, examine unnecessary steps, jargon, repeated input, hidden state,
and dependence on the user knowing implementation details. Verify every alleged
gap and load-bearing map fact from another angle: search alternate terminology,
inspect wrappers/tests/history, or run an authorized disposable browser scenario.
Do not report a feature as missing because the first file did not contain it.

## Report

Lead with at most three actions worth taking now, ranked by frequency and impact
on the user's job. Include the persona, journey evidence, four-axis coverage,
ranked gaps, and conflicts between roles. Fold low-impact suggestions together.
For a finding needing live verification, provide the exact action, expected
observation and finding it would confirm or refute. Do not claim a browser check
ran when only source was read. Hand off useful changes without implementing them
under a report-only request.

## Codex execution

Use available tools and the session model, targeting `gpt-6-astra`. No other skill
is required. Use multiple reviewers only when explicitly authorized and supported;
otherwise review the roles sequentially and disclose the single-agent limitation.
