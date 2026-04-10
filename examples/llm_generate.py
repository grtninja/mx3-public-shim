from mx3_public_shim.config import Settings
from mx3_public_shim.runtime import LocalRuntime


def main() -> None:
    runtime = LocalRuntime(Settings.from_env())
    reply = runtime.chat(
        [{"role": "user", "content": "Summarize why honest fallback matters for local inference."}]
    )
    print(reply)


if __name__ == "__main__":
    main()
