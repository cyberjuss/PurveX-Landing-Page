#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "${SCRIPT_DIR}/backend/venv" ] || [ ! -d "${SCRIPT_DIR}/frontend/node_modules" ]; then
  "${SCRIPT_DIR}/scripts/setup_purvex.sh"
fi

exec "${SCRIPT_DIR}/scripts/start_purvex.sh" "$@"
