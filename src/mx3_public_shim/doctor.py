from __future__ import annotations

import json
import platform
from typing import Any

from .config import Settings
from .runtime import LocalRuntime


def build_doctor_report(settings: Settings | None = None) -> dict[str, Any]:
    resolved = settings or Settings.from_env()
    runtime = LocalRuntime(resolved)
    system = platform.system().lower()
    boundaries = [
        "linux-direct-python-runtime-is-the-official-memryx-path",
        "windows-should-use-driver-tooling-or-a-local-mx3-backed-service",
        "wsl-is-for-compile-repo-flow-not-direct-python-runtime-ownership",
    ]
    return {
        "ok": True,
        "platform": {
            "system": system,
            "release": platform.release(),
        },
        "settings": resolved.public_dict(),
        "runtime": runtime.status_report(),
        "official_boundaries": boundaries,
    }


def main() -> None:
    print(json.dumps(build_doctor_report(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
