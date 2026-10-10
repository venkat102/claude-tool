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

## Inspect the rendered experience

For UI changes, visually inspect the rendered screen or supplied screenshots;
DOM assertions and successful clicks alone do not assess visual usability. Review
the whole affected screen, including a moved view in its new frame. Use realistic
content and workload: a one-row fixture cannot establish whether a management
list is easy to scan. Inspect representative populated states and relevant desktop
and narrow layouts when available; state gaps when rendering is unavailable.

Judge information hierarchy, density and spacing, alignment, label clarity,
status placement, and action prominence against the persona's task. Can they find
the relevant record, associate its state with it, compare records, and distinguish
the frequent or urgent action from secondary and destructive actions? Check
whether repeated controls, introductory copy or excessive row height obscure the
work at realistic volume. Compare with established product patterns where useful.

Tie visual findings to an observed layout and a concrete task cost or error risk;
distinguish these from aesthetic preferences. Do not prescribe compact rows,
overflow menus or another layout universally: hiding a frequent or urgent action
can make the experience worse. Record the inspected viewport, content/state and
visual evidence, and report visual usability separately from functional success.

## Exercise recovery in context

For a changed screen, walk the affected existing controls as well as the new flow:
entry/navigation, primary action, recovery and exit. A mounted component or a
screenshot does not prove an unclicked handler works. Include applicable keyboard,
voice and file paths; select the supported browser/transport conditions implicated
by the change rather than attempting every possible combination.

For asynchronous recovery, inspect what happens while other work is active, after
the user changes screens or composes a newer draft, and when success arrives after
the UI timeout. Verify where text, files, preferences and retained recordings end
up. Check that offered actions actually work in the displayed state, failures stay
visible, and historical results do not masquerade as current status. Distinguish
proven refusal from uncertain completion in both wording and recovery choices.
Record which scenarios were exercised live, simulated, source-inspected or remain
unverified; preserve those limits in the report's overall verdict.

## Report

Lead with at most three actions worth taking now, ranked by frequency and impact
on the user's job. Include the persona, journey evidence, four-axis coverage,
ranked gaps, and conflicts between roles. Fold low-impact suggestions together.
For UI reviews, include the visual-usability verdict and its evidence or explicitly
mark it unverified. Passing interaction tests must not stand in for that verdict.
For a finding needing live verification, provide the exact action, expected
observation and finding it would confirm or refute. Do not claim a browser check
ran when only source was read. Hand off useful changes without implementing them
under a report-only request.

## Codex execution

Use available tools and the session model, targeting `gpt-6-astra`. No other skill
is required. Use multiple reviewers only when explicitly authorized and supported;
otherwise review the roles sequentially and disclose the single-agent limitation.
