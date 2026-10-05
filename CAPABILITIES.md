# Capability Map

**Last Updated**: 2026-10-05T09:15:00+03:00

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

2026-10-05 weekly rebench on harness-arena@834d891: demoted tiny_code high→medium; extract_structured and rewrite_short_prose high→not_suitable (tip objective 0/3 and 0/2). Net: nothing local meets confidence_for_auto_route: high on tip — router falls to reject-default. Prior lean KEEP_OFF for opencode+lean (20261001-151618) unchanged; never force --lean-prompt here.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | medium | [20260928-231055](../runs/20260928-231055), [20260929-081437](../runs/20260929-081437), [20261001-151648](../runs/20261001-151648), [20261005-090323](../runs/20261005-090323), [20261005-085227](../runs/20261005-085227) | 2026-10-05 demoted high→medium on harness-arena@834d891. Hello-style one-liners still usable (20261005-090323); a 5-line fizz(n) came back markdown-fenced and does not compile (20261005-085227). Prefer -t code; do NOT force --lean-prompt (lean KEEP_OFF 20261001-151618). Not high: do not auto-route at confidence_for_auto_route: high — trivial one-liners with objective compile check only. |

#### Not Suitable For

- `extract_structured`
- `rewrite_short_prose`
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

- `tiny_code_snippet`

**Not suitable for local LLMs yet**: multi-file refactor, security review, architecture design, long context research, complex debugging, tool-heavy agent loops

---

*Generated from `capabilities.yaml`. To update, edit capabilities.yaml and run `npm run render-capabilities`.*
