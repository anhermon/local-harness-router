# Capability Map

**Last Updated**: 2026-09-29T05:15:00Z

**NOTE**: Evidence entries marked as empty `[]` are pending harness-arena dogfooding runs. The Dogfooding team will promote evidence after arena evaluations meet the quality bar (PASS ≥ 0.9, ≥2 runs, human review).

## Quality Policy

- **Quality Bar**: high
- **Minimum Runs**: 2
- **Confidence Levels**:
  - **high**: PASS >= 0.9 on rubric AND human/agent review note
  - **medium**: PASS >= 0.7 or preliminary positive signal
  - **low**: exploratory; not yet reliable

## Supported Harness:Model Combinations

### opencode:ollama/qwen2.5:3b-instruct

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | ⏳ pending | Single small file with clear spec (e.g., hello.py + SOLUTION.md). Evidence pending harness-arena dogfooding. |
| `explain_simple` | high | ⏳ pending | Short concept explanations, ELI5 style. Evidence pending harness-arena dogfooding. |
| `rewrite_short_prose` | medium | ⏳ pending | Short text rewrites ≤400 words. Needs more evaluation runs. |
| `classify_label` | medium | ⏳ pending | Closed-set classification tasks. Needs validation. |
| `extract_structured` | medium | ⏳ pending | Extract JSON/YAML from short text. Needs validation. |
| `unit_test_stub` | low | ⏳ pending | Generate simple test stubs. Exploratory. |

#### Not Suitable For

- `multi_file_refactor`
- `long_context_research`
- `security_review`
- `architecture_design`
- `complex_debugging`
- `tool_heavy_agent_loops`

## Task Type Taxonomy

Current task types supported across all harnesses:

- `classify_label`
- `explain_simple`
- `extract_structured`
- `rewrite_short_prose`
- `tiny_code_snippet`
- `unit_test_stub`

**Not suitable for local LLMs yet**: multi-file refactor, security review, architecture design, long context research, complex debugging, tool-heavy agent loops

---

*Generated from `capabilities.yaml`. To update, edit capabilities.yaml and run `npm run render-capabilities`.*
