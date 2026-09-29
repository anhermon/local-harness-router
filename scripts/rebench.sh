#!/bin/bash
set -e

# rebench.sh - Re-run harness-arena evaluations to refresh capability evidence
#
# This script runs a matrix of harness:model × task-type combinations through
# harness-arena to validate and refresh evidence for the capability map.
#
# Usage:
#   ./scripts/rebench.sh [--dry-run]
#
# Requirements:
#   - harness-arena installed and available in PATH or ../harness-arena/
#   - Local Ollama running with required models
#   - Harnesses (opencode, little-coder) available

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== local-harness-router rebench ==="
echo ""

# Check if harness-arena is available
ARENA_CMD=""
if command -v arena &> /dev/null; then
  ARENA_CMD="arena"
elif [[ -x "../harness-arena/arena" ]]; then
  ARENA_CMD="../harness-arena/arena"
elif [[ -x "./arena" ]]; then
  ARENA_CMD="./arena"
else
  echo -e "${RED}ERROR: harness-arena not found${NC}"
  echo ""
  echo "Please install harness-arena:"
  echo "  - Clone from: https://github.com/example/harness-arena"
  echo "  - Or ensure 'arena' command is in PATH"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓${NC} Found harness-arena: $ARENA_CMD"
echo ""

# Define rebench matrix
# Format: harness:model:task_type:prompt
declare -a MATRIX=(
  "opencode:ollama/qwen2.5:3b-instruct:tiny_code_snippet:Write a Python function that returns Hello World"
  "opencode:ollama/qwen2.5:3b-instruct:explain_simple:Explain what a linked list is in simple terms"
)

echo "Rebench matrix (${#MATRIX[@]} tasks):"
for task in "${MATRIX[@]}"; do
  IFS=':' read -r harness model task_type prompt <<< "$task"
  echo "  - $harness:$model [$task_type]"
done
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo -e "${YELLOW}[DRY-RUN MODE]${NC} Would execute arena runs but skipping actual execution"
  echo ""
  
  for task in "${MATRIX[@]}"; do
    IFS=':' read -r harness model task_type prompt <<< "$task"
    echo "Would run: $ARENA_CMD run --harness $harness --model $model --task-type $task_type"
  done
  
  exit 0
fi

# Execute arena runs
echo "Executing arena runs..."
echo ""

RUNS_DIR="$ROOT_DIR/runs"
mkdir -p "$RUNS_DIR"

SUCCESS_COUNT=0
FAIL_COUNT=0

for task in "${MATRIX[@]}"; do
  IFS=':' read -r harness model task_type prompt <<< "$task"
  
  echo -e "${GREEN}▸${NC} Running: $harness:$model [$task_type]"
  
  # Note: This is a stub - actual arena invocation will depend on arena's CLI interface
  # Adjust the command based on harness-arena's actual interface
  if $ARENA_CMD run --harness "$harness" --model "$model" --task-type "$task_type" --prompt "$prompt" 2>&1; then
    echo -e "  ${GREEN}✓${NC} Success"
    ((SUCCESS_COUNT++))
  else
    echo -e "  ${RED}✗${NC} Failed"
    ((FAIL_COUNT++))
  fi
  
  echo ""
done

# Summary
echo "=== Rebench Summary ==="
echo -e "Success: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "Failed:  ${RED}$FAIL_COUNT${NC}"
echo ""

if [[ $FAIL_COUNT -gt 0 ]]; then
  echo -e "${YELLOW}Some runs failed. Review logs in $RUNS_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All rebench runs completed successfully${NC}"
echo ""
echo "Next steps:"
echo "  1. Review arena run results in $RUNS_DIR"
echo "  2. For PASS ≥ 0.9, add run IDs to capabilities.yaml evidence arrays"
echo "  3. File judgment notes in evidence/"
echo "  4. Run: npm run render-capabilities"
