# local-harness-router

**Capability map + CLI: route prompts to local harness:model pairs (Ollama via opencode/little-coder); evidence from harness-arena**

## Overview

`local-harness-router` maintains a living capability map of `{harness, model} → task types` that local LLMs can perform at high quality. It routes prompts to the most suitable local harness:model pair based on evidence from harness-arena evaluation runs.

## Quick Start

### Installation

```bash
npm install
# or
npm install -g .
```

### Usage

```bash
# Dry-run: see what would be chosen without executing
local-route "Write a hello world in Python" --dry-run

# Execute via local harness (if available)
local-route "Write a hello world in Python"

# Specify task type explicitly
local-route "Explain what a linked list is" --task-type explain_simple

# Configure fallback behavior
local-route "Complex refactoring task" --fallback reject
```

### CLI Options

```
local-route "<prompt>" [options]

Options:
  --task-type <type>      Explicitly specify task type (bypasses classification)
  --fallback <mode>       Fallback behavior: reject | frontier (default: reject)
  --dry-run              Print routing decision without executing
  -h, --help             Show help
```

## Capability Map

The capability map is maintained in `capabilities.yaml` and rendered to `CAPABILITIES.md` for easy viewing. Each entry includes:

- **Harness + Model**: The execution environment and model
- **Task Types**: Specific task categories the combination can handle
- **Confidence**: high | medium | low (based on arena evaluation runs)
- **Evidence**: Links to harness-arena run IDs that validate the capability
- **Notes**: Human-readable context

See `CAPABILITIES.md` for the current capability table.

## Task Type Taxonomy

Current task types (expand as evidence grows):

- `tiny_code_snippet` — Single small file with clear spec
- `rewrite_short_prose` — Edit/rewrite ≤400 words
- `classify_label` — Pick from closed label set
- `extract_structured` — Extract JSON/YAML from short text
- `explain_simple` — ELI5 / short concept explanation
- `unit_test_stub` — Simple test for a small function

**Not suitable for local (yet)**: multi-file refactor, security review, architecture design, long research, tool-heavy agent loops

## Configuration

Edit `config.yaml` to customize:

- **fallback**: `reject` (default) or `frontier` (requires API keys)
- **require_confidence**: minimum confidence level for auto-routing
- **frontier.enabled**: opt-in frontier provider fallback
- **arena.url**: harness-arena service endpoint

## Evidence & Quality Bar

All capability claims require:
- **PASS ≥ 0.9** on harness-arena rubric
- **≥2 independent arena runs**
- **Human/agent review note** in `evidence/`
- **Manual or objective verification** that artifacts are actually usable

**Important:** Arena skeleton PASS (e.g., `SOLUTION.md` exists) is insufficient alone. Several FAIL-quality cells can still achieve PASS 1.00 on skeleton checks. The Dogfooding team always performs manual or objective post-checks before promoting to `high` confidence.

Confidence levels:
- **high**: PASS ≥ 0.9, ≥2 runs, verified usable artifacts
- **provisional**: promising but awaiting full arena evaluation
- **medium**: PASS ≥ 0.7 or preliminary positive signal
- **low**: exploratory; not yet reliable

Evidence links are maintained by the Dogfooding team through harness-arena evaluation runs. See `evidence/README.md` for details.

## Scripts

### Rebench Capabilities

Re-run harness-arena evaluations to refresh evidence:

```bash
./scripts/rebench.sh
```

This script calls `harness-arena` for the capability matrix. Requires harness-arena to be installed locally.

### Render Capability Table

Regenerate `CAPABILITIES.md` from `capabilities.yaml`:

```bash
npm run render-capabilities
# or
./scripts/render-capabilities.sh
```

## Development

### Project Structure

```
.
├── SPEC.md                    # Product specification
├── README.md                  # This file
├── capabilities.yaml          # Source of truth: capability map
├── capabilities.json          # Auto-generated for agents
├── CAPABILITIES.md            # Human-readable capability table
├── config.yaml               # Router configuration
├── package.json              # Node.js dependencies
├── src/
│   ├── cli.js                # CLI entry point
│   ├── router.js             # Routing logic
│   ├── classifier.js         # Task type classification
│   └── capabilities.js       # Capability map loader
├── scripts/
│   ├── rebench.sh           # Re-run arena evaluations
│   └── render-capabilities.sh # Regenerate CAPABILITIES.md
├── evidence/                 # Arena run notes and links
│   └── README.md
└── test/                     # Tests for routing logic
    └── router.test.js
```

### Testing

```bash
npm test
```

## Dogfooding Workflow

1. Identify a task type to evaluate
2. Run `./arena run` against target harness:model
3. Collect PASS score and human review
4. If PASS ≥ 0.9 and quality bar met, add run ID to `capabilities.yaml`
5. File judgment note in `evidence/`
6. Regenerate `CAPABILITIES.md`

## Constraints (v0)

- **No Codex/Agy/Claude** sandbox logins (ToS caution)
- **Local Ollama only**: `qwen2.5:3b-instruct`, `qwen2.5:0.5b`
- **Local harnesses**: `opencode`, `little-coder` (wired to Ollama)
- **Frontier fallback**: config-gated, off by default, not wired in v0

## See Also

- `SPEC.md` — Full product specification
- `CAPABILITIES.md` — Current capability table
- `evidence/README.md` — Evidence collection process
- [harness-arena](https://github.com/example/harness-arena) — Evaluation engine (placeholder link)

---

**Status**: v0 — Router and capability map structure complete. Evidence promotion in progress by Dogfooding team.
