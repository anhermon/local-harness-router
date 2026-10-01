# Capability Map

**Last Updated**: 2026-10-01T15:19:00+03:00

**NOTE**: Promoted / provisional task-type rows cite harness-arena run IDs (dogfood evidence; see `evidence/`). Rows without evidence render as pending. Further **high** promotions still require the quality bar (PASS ≥ 0.9, ≥2 runs, human review, objective check). `provisional` = promote-with-notes (not auto-routed at `require_confidence: high`).

## Quality Policy

- **Quality Bar**: high
- **Minimum Runs**: 2
- **Confidence Levels**:
  - **high**: PASS >= 0.9 on rubric AND human/agent review note AND ≥2 arena runs
  - **provisional**: promising for task type; awaiting arena evaluation for high promotion
  - **medium**: PASS >= 0.7 or preliminary positive signal
  - **low**: exploratory; not yet reliable

## Supported Harness:Model Combinations

### opencode:ollama/qwen2.5:3b-instruct

Proven daily path without lean-prompt. KEEP_OFF for opencode+lean (20261001-151618): degraded, garbage text, no tools/files — worse than default. Leave default routing alone; never force --lean-prompt here.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20260928-231055](../runs/20260928-231055), [20260929-081437](../runs/20260929-081437), [20261001-151648](../runs/20261001-151648) | Single small file (e.g. hello.py) + SOLUTION.md. Code usable; SOLUTION.md often formulaic. Prefer -t code. Default (non-lean) path reconfirmed PASS on harness-arena@834d891 (20261001-151648). Do NOT force --lean-prompt on this cell — lean regresses it. |
| `extract_structured` | high | [20260929-081619](../runs/20260929-081619), [20260929-083323](../runs/20260929-083323) | Short text → named result.json with strict schema; no markdown fences. Use code task type, not creative/output.md. Occasional hang after JSON write (see 20260929-082813) — keep prompts tiny. |
| `rewrite_short_prose` | high | [20260929-082405](../runs/20260929-082405), [20260929-083411](../runs/20260929-083411) | ≤~40 word rewrite into rewrite.md + SOLUTION.md. Name the content file explicitly; do not rely on SOLUTION.md alone. |

#### Not Suitable For

- `classify_label`
- `explain_simple`
- `unit_test_stub`
- `multi_file_refactor`
- `long_context_research`
- `security_review`
- `architecture`
- `tool_heavy_agent_loops`
- `creative_json_only_output_md`

### little-coder:ollama/qwen2.5:3b-instruct

Lean-only provisional candidate for tiny_code_snippet (run 20261001-145407, harness-arena@834d891). Default (non-lean) LC still unusable. Require ARENA_ALLOW_LITTLE_CODER=1 + --lean-prompt; enforce run timeout and objective check before treating as success.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | provisional | [20261001-145407](../runs/20261001-145407) | PROMOTE_CANDIDATE only with lean-prompt (or equivalent short system + LITTLE_CODER_PROJECT_CONTEXT=0). First objective PASS on this box (was empty {}). Caveats: hang-after-write (need timeout/SIGKILL); hello.py may have extra \n; large stdout (~56 MiB). Gate on timeout + objective check (arena-daily check), not skeleton PASS. Not high: n=1 and ops hang risk. Without lean: still empty {} / do not route. |

#### Not Suitable For

- `extract_structured`
- `classify_label`
- `rewrite_short_prose`
- `explain_simple`
- `unit_test_stub`
- `multi_file_refactor`
- `long_context_research`
- `security_review`
- `architecture`
- `tool_heavy_agent_loops`

### pi:ollama/qwen2.5:3b-instruct

KEEP_OFF / do not promote. Even with --lean-prompt (20261001-151107): hello.py/SOLUTION.md landed on run root, not cell cwd; objective FAIL; hung → SIGTERM. Not promotable until writes stay in cell cwd and exit cleanly.

#### Not Suitable For

- `tiny_code_snippet`
- `*`

### opencode:ollama/qwen3.5:4b@none

KEEP_OFF / do not promote (unchanged). Prior recheck 20261001-075532: degraded, no files, tool-as-text. Not re-run in lean rebench.

#### Not Suitable For

- `tiny_code_snippet`
- `*`

### opencode:ollama/qwen2.5:0.5b

Too small for arena contract + tool loop; do not route.

#### Not Suitable For

- `tiny_code_snippet`
- `*`

## Task Type Taxonomy

Current task types supported across all harnesses:

- `extract_structured`
- `rewrite_short_prose`
- `tiny_code_snippet`

**Not suitable for local LLMs yet**: multi-file refactor, security review, architecture design, long context research, complex debugging, tool-heavy agent loops

---

*Generated from `capabilities.yaml`. To update, edit capabilities.yaml and run `npm run render-capabilities`.*
