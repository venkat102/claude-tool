# Repository guidance

This repository ships instruction-only workflows. `commands/` contains the
original Claude Code commands; `codex/skills/` contains independently maintained
Codex adaptations. Preserve the original commands when changing the Codex port.

The Codex target is `gpt-6-astra`. Skills inherit the session model; they do not
configure credentials, switch providers, or grant additional permissions.

Keep skills self-contained and their discovery descriptions narrow. Preserve
evidence, acceptance criteria, risk-scaled review, and user-experience checks.
Do not introduce mandatory unavailable skills, tools, model aliases, or reviewer
panels. Explicit user instructions and higher-priority instructions take precedence.

Validate installer changes with `python3 -m unittest discover -s tests -v`.
Use disposable directories for installation tests. Never overwrite another skill
installation. Review skill behavior separately from structural validation; a valid
Markdown file does not prove good agent decisions.
