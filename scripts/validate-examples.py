#!/usr/bin/env python3
"""Validate example snippets used for the book.

This is intentionally lightweight and only checks that representative snippets
are syntactically valid (JSON/YAML/Python/Shell). It prevents copy/paste
breakage caused by accidental symbol replacement or deprecated API usage.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def _error(msg: str) -> None:
    print(f"::error::{msg}", file=sys.stderr)


def _check_json(paths: list[Path]) -> bool:
    ok = True
    for p in paths:
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            _error(f"Invalid JSON: {p}: {e}")
            ok = False
    return ok


def _check_yaml(paths: list[Path]) -> bool:
    try:
        import yaml  # type: ignore
    except Exception:
        _error("PyYAML is required to validate YAML examples (pip install pyyaml).")
        return False

    ok = True
    for p in paths:
        try:
            yaml.safe_load(p.read_text(encoding="utf-8"))
        except Exception as e:
            _error(f"Invalid YAML: {p}: {e}")
            ok = False
    return ok


def _check_python(paths: list[Path]) -> bool:
    import py_compile

    ok = True
    for p in paths:
        try:
            py_compile.compile(str(p), doraise=True)
        except Exception as e:
            _error(f"Python syntax error: {p}: {e}")
            ok = False
    return ok


def _check_shell(paths: list[Path]) -> bool:
    ok = True
    for p in paths:
        proc = subprocess.run(["bash", "-n", str(p)], capture_output=True, text=True)
        if proc.returncode != 0:
            _error(f"Shell syntax error: {p}: {proc.stderr.strip()}")
            ok = False
    return ok


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    examples = repo_root / "examples"

    if not examples.is_dir():
        print("examples/: not found; skipping")
        return 0

    json_paths = sorted((examples / "json").glob("*.json"))
    yaml_paths = sorted((examples / "yaml").glob("*.yml")) + sorted((examples / "yaml").glob("*.yaml"))
    py_paths = sorted((examples / "python").glob("*.py"))
    sh_paths = sorted((examples / "shell").glob("*.sh"))

    ok = True
    ok &= _check_json(json_paths)
    ok &= _check_yaml(yaml_paths)
    ok &= _check_python(py_paths)
    ok &= _check_shell(sh_paths)

    if ok:
        print(
            "examples validation: OK "
            f"(json={len(json_paths)}, yaml={len(yaml_paths)}, py={len(py_paths)}, sh={len(sh_paths)})"
        )
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
