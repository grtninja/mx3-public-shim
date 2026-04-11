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

SOURCE_ONLY_ROOT_ITEMS = {
    "SYNC_FROM_MAIN_REPO.md",
    "export_overlay",
}

EXCLUDED_RELATIVE_PATHS = {
    "SYNC_FROM_MAIN_REPO.md",
    "docs/CODEX_SETUP_AND_PUBLIC_SYNC.md",
    "docs/PRIVATE_PUBLIC_EXPORT_WORKFLOW.md",
    "docs/TRACKED_PUBLIC_REPO.md",
    "docs/MEMPALACE_PR_CANDIDATE.md",
    "contrib/mempalace/PR_CANDIDATE.md",
    "contrib/memryx/MxAccl_WINDOWS_RECOVERY_PR_CANDIDATE.md",
    "contrib/memryx/MemryX_eXamples_COMPANION_PR_CANDIDATE.md",
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
    "blocked-lore-a": re.compile(
        r"\b" + phrase("shadow") + r"(?:-|\s+)" + phrase("memory") + r"\b",
        re.IGNORECASE,
    ),
    "blocked-lore-b": re.compile(
        r"\b"
        + phrase("skeptical")
        + r"(?:\s+"
        + phrase("pointer")
        + r"s?|\-"
        + phrase("memory")
        + r")\b",
        re.IGNORECASE,
    ),
    "blocked-lore-c": re.compile(
        r"\b" + phrase("pointer") + r"\s+" + phrase("ledger") + r"\b",
        re.IGNORECASE,
    ),
    "blocked-lore-d": re.compile(
        r"\b" + phrase("continuity") + r"\s+(?:before|after)\s+" + phrase("compaction") + r"\b",
        re.IGNORECASE,
    ),
    "blocked-lore-e": re.compile(
        r"\b(?:"
        + "|".join(
            [
                phrase("Penny", "GPT"),
                phrase("STAR", "FRAME"),
                phrase("Mesh", "GPT"),
                phrase("Guardian", "Trace"),
                phrase("Meta", "Ranker"),
            ]
        )
        + r")\b",
        re.IGNORECASE,
    ),
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

REQUIRED_TEXT_MARKERS = {
    "README.md": [
        "memryx-shim-provider",
        "https://www.lmstudio.ai/grtninja/memryx-shim-provider",
        "LM model loading belongs to LM Studio, not this app.",
    ],
    "CONTRIBUTING.md": [
        "## Shared release order",
        "authoritative shim change",
        "published plugin",
        "public shim",
        "internal stack lore",
    ],
}


def iter_all_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if path.is_dir():
            continue
        if ".git" in path.parts:
            continue
        if rel.as_posix() in EXCLUDED_RELATIVE_PATHS:
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
        if child.name in SOURCE_ONLY_ROOT_ITEMS:
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
        for marker in REQUIRED_TEXT_MARKERS.get(rel, []):
            if marker not in text:
                findings.append(
                    {
                        "kind": "missing-required-marker",
                        "path": rel,
                        "detail": f"missing required marker: {marker}",
                    }
                )

    report = {"ok": not findings, "finding_count": len(findings), "findings": findings}
    print(json.dumps(report, indent=2))
    return 0 if not findings else 1


if __name__ == "__main__":
    raise SystemExit(main())
