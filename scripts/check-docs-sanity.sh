#!/usr/bin/env bash
set -euo pipefail

SCAN_DIR="${1:-docs}"

fail=0

echo "Docs sanity check: scanning '$SCAN_DIR'..."

# These characters frequently appear when code is not fenced/inline-coded properly,
# causing copy/paste breakage (smart quotes, replaced symbols, etc.).
if rg -n "[“”‘’]" "$SCAN_DIR"; then
  echo "Found smart quotes in docs. Wrap code in fences/inline code and use ASCII quotes." >&2
  fail=1
fi

if rg -n "»" "$SCAN_DIR"; then
  echo "Found '»' (redirect symbol replacement) in docs. Use ASCII operators like '>>'." >&2
  fail=1
fi

# Deprecated/fragile API usage in code examples.
if rg -n "method_whitelist" "$SCAN_DIR"; then
  echo "Found deprecated urllib3 Retry option 'method_whitelist'. Use 'allowed_methods'." >&2
  fail=1
fi

if rg -n "requests\\.packages\\.urllib3\\.util\\.retry" "$SCAN_DIR"; then
  echo "Found requests-internal urllib3 import path. Prefer 'from urllib3.util.retry import Retry'." >&2
  fail=1
fi

# Common typo that breaks Python f-strings in the book.
if rg -n "\\.[0-9]+\\s+f" "$SCAN_DIR"; then
  echo "Found invalid Python format spec like '.2 f'. Remove spaces (e.g. '.2f')." >&2
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "Docs sanity check: FAILED" >&2
  exit 1
fi

echo "Docs sanity check: OK"

