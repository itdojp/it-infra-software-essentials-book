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
    ok = True
    for p in paths:
        try:
            # Parse-only compile; avoid generating __pycache__/ files during validation.
            src = p.read_text(encoding="utf-8")
            compile(src, str(p), "exec")
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

    json_dir = examples / "json"
    yaml_dir = examples / "yaml"
    py_dir = examples / "python"
    sh_dir = examples / "shell"

    ok = True

    for d in [json_dir, yaml_dir, py_dir, sh_dir]:
        if not d.is_dir():
            _error(f"Missing examples directory: {d}")
            ok = False

    json_paths = sorted(json_dir.glob("*.json")) if json_dir.is_dir() else []
    yaml_paths = (sorted(yaml_dir.glob("*.yml")) + sorted(yaml_dir.glob("*.yaml"))) if yaml_dir.is_dir() else []
    py_paths = sorted(py_dir.glob("*.py")) if py_dir.is_dir() else []
    sh_paths = sorted(sh_dir.glob("*.sh")) if sh_dir.is_dir() else []

    if not json_paths:
        _error(f"No JSON examples found under: {json_dir}")
        ok = False
    if not yaml_paths:
        _error(f"No YAML examples found under: {yaml_dir}")
        ok = False
    if not py_paths:
        _error(f"No Python examples found under: {py_dir}")
        ok = False
    if not sh_paths:
        _error(f"No Shell examples found under: {sh_dir}")
        ok = False

    if not ok:
        return 1

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
