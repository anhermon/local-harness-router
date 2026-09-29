# local-harness-router — SPEC

## Goal
A single project that:
1. Maintains a **capability map** of `{harness, model} → task types` that local LLMs can do at **high quality with high confidence** (not "produced something").
2. Exposes that map to **humans and agents**.
3. Accepts a **prompt** (+ optional hints) and routes to the most suitable local `harness:model`.
4. Supports **configurable fallback**: `reject` | `frontier` (opt-in only; default reject — no API keys assumed).
5. Uses **harness-arena** as the experiment / evidence engine; map updates only from evaluated runs that meet quality bars.

## Constraints (Angel 2026-09-29)
- No Codex / Agy / Claude account login on the sandbox for now (ToS / ban caution).
- Prefer local Ollama models already on box: `qwen2.5:3b-instruct`, `qwen2.5:0.5b` (expand as more local models appear).
- Working local harnesses today: `opencode` (wired to local Ollama), `little-coder` (Ollama).
- Frontier fallback is config-gated and off by default.

## Capability map (source of truth)
File: `capabilities.yaml` (also publish JSON for agents).

```yaml
version: 1
updated_at: ISO8601
policy:
  quality_bar: "high"          # only promote after PASS >= 0.9 on rubric AND human/agent review note
  min_runs: 2                  # at least 2 independent arena runs before promote
  confidence: high|medium|low  # high required for auto-route
entries:
  - harness: opencode
    model: ollama/qwen2.5:3b-instruct
    task_types:
      - id: tiny_code_snippet
        confidence: high
        evidence: [arena-run-ids...]
        notes: "hello.py + SOLUTION.md style"
      - id: short_summarize
        confidence: medium
        ...
    not_suitable:
      - multi_file_refactor
      - long_context_research
```

### Initial task-type taxonomy (extend as evidence grows)
- `tiny_code_snippet` — single small file, clear spec
- `rewrite_short_prose` — ≤~400 words rewrite/edit
- `classify_label` — pick from a closed label set
- `extract_structured` — JSON/YAML from short text
- `explain_simple` — ELI5 / short concept explanation
- `unit_test_stub` — one small test for a tiny function
- **Not for local until proven:** multi-file refactor, security review, architecture, long research, tool-heavy agent loops

## Router CLI / library
```
local-route "<prompt>" [--task-type T] [--fallback reject|frontier] [--dry-run]
→ prints chosen harness:model + why, then optionally runs via arena/harness
```

Config `config.yaml`:
```yaml
fallback: reject          # or frontier
frontier:
  enabled: false
  # only if enabled + credentials present
require_confidence: high
arena:
  url: http://127.0.0.1:5188
  runs_dir: ...
```

## Harness-arena integration
- Prefer invoking existing `./arena run` against discovered local cells.
- Store evidence links to `runs/<id>/`.
- Eval: reuse arena PASS/rubric where available; for promote-to-map require PASS ≥ 0.9 and a short judgment note in `evidence/`.

## Agent + human visibility
- `capabilities.yaml` + rendered `CAPABILITIES.md` table (harness | model | task types | confidence | last verified).
- Optional MCP or simple HTTP `GET /capabilities` for agents.
- Dogfooding/Engineering both consume the same files.

## Standing improvement loop
- Periodic harness-arena batches as new local models appear or harnesses improve.
- Demote entries that fail re-bench.
- Never auto-promote on a single lucky run.

## Definition of done (v0)
1. Repo with README, SPEC, capabilities.yaml (seeded from real local runs), CAPABILITIES.md.
2. `local-route` CLI: dry-run routing + optional execute via opencode/little-coder local.
3. At least 2 task types promoted to high confidence for `opencode:ollama/qwen2.5:3b-instruct` with linked arena run ids.
4. Config default `fallback: reject`.
5. Script `scripts/rebench.sh` to re-run a small matrix and refresh evidence.

## Non-goals (v0)
- Replacing harness-arena UI
- Shipping frontier providers by default
- Claiming capabilities without evidence
