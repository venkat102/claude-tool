#!/usr/bin/env python3
"""Link the Codex skills into a discovery directory without replacing other skills."""

import argparse
from pathlib import Path


SKILL_NAMES = (
    "ct-architect",
    "ct-plan-check",
    "ct-implement",
    "ct-review-loop",
    "ct-wear-the-coat",
    "ct-release-notes",
)
SOURCE_ROOT = Path(__file__).resolve().parents[1] / "codex" / "skills"


def install(destination: Path, *, dry_run: bool = False) -> list[tuple[str, str]]:
    """Preflight every target; leave existing installations untouched on conflicts."""
    destination = destination.expanduser().absolute()
    plan = []
    for name in SKILL_NAMES:
        source = SOURCE_ROOT / name
        if not (source / "SKILL.md").is_file():
            raise ValueError(f"Missing skill source: {source}")
        target = destination / name
        if target.is_symlink():
            if target.resolve() == source.resolve():
                plan.append(("already linked", name))
                continue
            raise FileExistsError(f"Refusing to replace existing symlink: {target}")
        if target.exists():
            raise FileExistsError(f"Refusing to replace existing path: {target}")
        plan.append(("link", name))
    if dry_run:
        return plan

    destination.mkdir(parents=True, exist_ok=True)
    created = []
    try:
        for action, name in plan:
            if action == "link":
                target = destination / name
                source = SOURCE_ROOT / name
                target.symlink_to(source, target_is_directory=True)
                created.append((target, source))
    except OSError:
        # Undo only links made by this invocation, never an existing skill.
        for target, source in reversed(created):
            if target.is_symlink() and target.readlink() == source:
                target.unlink()
        raise
    return plan


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--destination",
        type=Path,
        default=Path.home() / ".agents" / "skills",
        help="Discovery directory (default: ~/.agents/skills); use .agents/skills for one repo",
    )
    parser.add_argument("--dry-run", action="store_true", help="Check and show links without writing")
    args = parser.parse_args()
    try:
        plan = install(args.destination, dry_run=args.dry_run)
    except (OSError, ValueError) as exc:
        parser.exit(1, f"Installation failed: {exc}\n")
    for action, name in plan:
        print(f"{action}: {args.destination.expanduser() / name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
