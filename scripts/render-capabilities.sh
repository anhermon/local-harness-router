#!/bin/bash
set -e

# render-capabilities.sh - Regenerate CAPABILITIES.md from capabilities.yaml
#
# This is a simple wrapper around the Node.js renderer

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Please install Node.js >= 18"
  exit 1
fi

echo "Rendering capabilities..."
node src/render-capabilities.js
echo "Done."
