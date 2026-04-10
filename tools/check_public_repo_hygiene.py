from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def phrase(*parts: str) -> str:
    return "".join(parts)


ALLOWED_ROOT_ITEMS = {
    ".github",
    ".gitattributes",
    ".gitignore",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "README.md",
    "SECURITY.md",
    "SUPPORT.md",
    "contrib",
    "docs",
    "electron",
    "examples",
    "package-lock.json",
    "package.json",
    "pyproject.toml",
    "src",
    "tests",
    "tools",
}

BLOCKED_LITERALS = [
    phrase("public", "-safe"),
    phrase("thin", " shim", " candidate"),
    phrase("tracked", " public", " mirror"),
    phrase("private", " workstation", " repo"),
    phrase("canonical", " candidate"),
    phrase("canonical", " private", " candidate"),
    phrase("authoring", " surface"),
    phrase("private", "-canonical", "-candidate"),
    phrase("tracked", "-public", "-mirror"),
]

BLOCKED_TEXT_PATTERNS = {
    "windows-user-path": re.compile(r"[A-Za-z]:\\Users\\[A-Za-z0-9._-]+"),
    "unix-home-path": re.compile(r"/home/[A-Za-z0-9._-]+"),
    "mac-home-path": re.compile(r"/Users/[A-Za-z0-9._-]+"),
}

SECRET_PATTERNS = {
    "openai": re.compile(r"\bsk-[A-Za-z0-9]{16,}\b"),
    "github_classic": re.compile(r"\bghp_[A-Za-z0-9]{20,}\b"),
    "github_fine_grained": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    "slack": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"),
}

BLOCKED_DIR_PARTS = {
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    ".continue",
    "node_modules",
    "build",
    "dist",
}

BLOCKED_SUFFIXES = {".pyc", ".pyo", ".db", ".sqlite", ".sqlite3", ".jsonl"}

TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".toml",
    ".txt",
    ".yaml",
    ".yml",
}


def iter_all_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        if ".git" in path.parts:
            continue
        files.append(path)
    return files


def iter_text_files(root: Path) -> list[Path]:
    return [
        path
        for path in iter_all_files(root)
        if path.suffix.lower() in TEXT_SUFFIXES or path.name in {"LICENSE"}
    ]


def main() -> int:
    findings: list[dict[str, str]] = []

    for child in ROOT.iterdir():
        if child.name == ".git":
            continue
        if child.name not in ALLOWED_ROOT_ITEMS:
            findings.append(
                {
                    "kind": "unexpected-root-item",
                    "path": child.name,
                    "detail": "unexpected top-level item in public repo",
                }
            )

    for path in iter_all_files(ROOT):
        rel = path.relative_to(ROOT).as_posix()
        if any(part in BLOCKED_DIR_PARTS for part in path.relative_to(ROOT).parts):
            findings.append(
                {
                    "kind": "blocked-path-part",
                    "path": rel,
                    "detail": "generated or runtime directory is present",
                }
            )
        if path.suffix.lower() in BLOCKED_SUFFIXES:
            findings.append(
                {
                    "kind": "blocked-file-type",
                    "path": rel,
                    "detail": f"blocked file suffix: {path.suffix.lower()}",
                }
            )

    for path in iter_text_files(ROOT):
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        for literal in BLOCKED_LITERALS:
            if literal in text:
                findings.append(
                    {
                        "kind": "blocked-literal",
                        "path": rel,
                        "detail": f"contains blocked literal: {literal}",
                    }
                )
        for label, pattern in BLOCKED_TEXT_PATTERNS.items():
            if pattern.search(text):
                findings.append(
                    {
                        "kind": "blocked-pattern",
                        "path": rel,
                        "detail": f"matched blocked public pattern: {label}",
                    }
                )
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                findings.append(
                    {
                        "kind": "secret-pattern",
                        "path": rel,
                        "detail": f"matched possible {label} secret pattern",
                    }
                )

    report = {"ok": not findings, "finding_count": len(findings), "findings": findings}
    print(json.dumps(report, indent=2))
    return 0 if not findings else 1


if __name__ == "__main__":
    raise SystemExit(main())
