# Capability Map

**Last Updated**: 2026-09-29T08:36:00+03:00

**NOTE**: Promoted task-type rows cite harness-arena run IDs (dogfood evidence from PR #2). Rows without evidence render as pending. Further promotions still require the quality bar (PASS ≥ 0.9, ≥2 runs, human review).

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

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20260928-231055](../runs/20260928-231055), [20260929-081437](../runs/20260929-081437) | Single small file (e.g. hello.py) + SOLUTION.md. Code usable; SOLUTION.md often formulaic. Prefer -t code. |
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

#### Not Suitable For

- `tiny_code_snippet`
- `extract_structured`
- `classify_label`
- `rewrite_short_prose`
- `explain_simple`
- `unit_test_stub`
- `*`

### opencode:ollama/qwen2.5:0.5b

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
