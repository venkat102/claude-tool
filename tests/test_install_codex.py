import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "installer", Path(__file__).resolve().parents[1] / "scripts" / "install_codex.py"
)
installer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(installer)


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.destination = Path(self.temp.name) / "skills"

    def test_links_all_skills_and_is_idempotent(self):
        installer.install(self.destination)
        for name in installer.SKILL_NAMES:
            target = self.destination / name
            self.assertTrue(target.is_symlink())
            self.assertEqual(target.resolve(), (installer.SOURCE_ROOT / name).resolve())
            self.assertTrue((target / "SKILL.md").is_file())
        self.assertEqual(
            installer.install(self.destination),
            [("already linked", name) for name in installer.SKILL_NAMES],
        )

    def test_dry_run_does_not_create_destination(self):
        self.assertEqual(len(installer.install(self.destination, dry_run=True)), 6)
        self.assertFalse(self.destination.exists())

    def test_conflict_does_not_partially_install_or_overwrite(self):
        occupied = self.destination / installer.SKILL_NAMES[-1]
        occupied.mkdir(parents=True)
        marker = occupied / "mine.txt"
        marker.write_text("preserve me")
        with self.assertRaises(FileExistsError):
            installer.install(self.destination)
        self.assertEqual(list(self.destination.iterdir()), [occupied])
        self.assertEqual(marker.read_text(), "preserve me")

    def test_broken_symlink_is_a_conflict(self):
        self.destination.mkdir()
        target = self.destination / installer.SKILL_NAMES[-1]
        target.symlink_to(self.destination / "missing")
        with self.assertRaises(FileExistsError):
            installer.install(self.destination)
        self.assertTrue(target.is_symlink())
        self.assertEqual(list(self.destination.iterdir()), [target])

    def test_missing_source_does_not_install(self):
        with patch.object(installer, "SOURCE_ROOT", Path(self.temp.name) / "missing"):
            with self.assertRaises(ValueError):
                installer.install(self.destination)
        self.assertFalse(self.destination.exists())

    def test_failure_rolls_back_only_new_links(self):
        self.destination.mkdir()
        first = self.destination / installer.SKILL_NAMES[0]
        first.symlink_to(installer.SOURCE_ROOT / first.name, target_is_directory=True)
        real_link = Path.symlink_to

        def fail_late(path, target, **kwargs):
            if path.name == installer.SKILL_NAMES[-1]:
                raise OSError("synthetic filesystem failure")
            return real_link(path, target, **kwargs)

        with patch.object(Path, "symlink_to", fail_late):
            with self.assertRaises(OSError):
                installer.install(self.destination)
        self.assertEqual(list(self.destination.iterdir()), [first])
        self.assertTrue(first.is_symlink())


if __name__ == "__main__":
    unittest.main()
