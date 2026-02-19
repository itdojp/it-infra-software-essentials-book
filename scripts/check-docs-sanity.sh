#!/usr/bin/env bash
set -euo pipefail

SCAN_DIR="${1:-docs}"

fail=0

echo "Docs sanity check: scanning '$SCAN_DIR'..."

SEARCH_CMD=(rg -n --)
if ! command -v rg >/dev/null 2>&1; then
  # ripgrep (rg) may not be preinstalled in all environments (e.g., fresh CI runners).
  # Fall back to grep to keep this check reliable.
  SEARCH_CMD=(grep -R -E -n --)
fi

# These characters frequently appear when code is not fenced/inline-coded properly,
# causing copy/paste breakage (smart quotes, replaced symbols, etc.).
if "${SEARCH_CMD[@]}" "[“”‘’]" "$SCAN_DIR"; then
  echo "Found smart quotes in docs. Wrap code in fences/inline code and use ASCII quotes." >&2
  fail=1
fi

if "${SEARCH_CMD[@]}" "»" "$SCAN_DIR"; then
  echo "Found '»' (redirect symbol replacement) in docs. Use ASCII operators like '>>'." >&2
  fail=1
fi

# Deprecated/fragile API usage in code examples.
if "${SEARCH_CMD[@]}" "method_whitelist" "$SCAN_DIR"; then
  echo "Found deprecated urllib3 Retry option 'method_whitelist'. Use 'allowed_methods'." >&2
  fail=1
fi

if "${SEARCH_CMD[@]}" "requests\\.packages\\.urllib3\\.util\\.retry" "$SCAN_DIR"; then
  echo "Found requests-internal urllib3 import path. Prefer 'from urllib3.util.retry import Retry'." >&2
  fail=1
fi

# Common typo that breaks Python f-strings in the book.
if "${SEARCH_CMD[@]}" "\\.[0-9]+[[:space:]]+f" "$SCAN_DIR"; then
  echo "Found invalid Python format spec like '.2 f'. Remove spaces (e.g. '.2f')." >&2
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "Docs sanity check: FAILED" >&2
  exit 1
fi

echo "Docs sanity check: OK"
