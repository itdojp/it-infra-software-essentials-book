#!/usr/bin/env bash
set -euo pipefail

echo "start" >> /tmp/my_app.log

# stderr append
non_existent_command 2>> /tmp/error.log || true

# stdout+stderr append (bash)
echo "done" &>> /tmp/my_app.log

# POSIX-compatible alternative:
# echo "done" >> /tmp/my_app.log 2>&1
