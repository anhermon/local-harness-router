# Capability Map

**Last Updated**: 2026-10-08T23:15:00+03:00

**NOTE**: Promoted / provisional task-type rows cite harness-arena run IDs (dogfood evidence; see `evidence/`). Rows without evidence render as pending. Further **high** promotions still require the quality bar (PASS ≥ 0.9, ≥2 runs, human review, objective check). `provisional` = promote-with-notes; ranks below medium (not auto-routed at `require_confidence: high` or `medium`).

## Quality Policy

- **Quality Bar**: high
- **Minimum Runs**: 2
- **Confidence Levels**:
  - **high**: PASS >= 0.9 on rubric AND human/agent review note AND ≥2 arena runs
  - **medium**: PASS >= 0.7 or preliminary positive signal (evidence-backed; outranks provisional)
  - **provisional**: promising / promote-with-notes; awaiting arena evaluation — ranks below medium; only auto-routes at require_confidence: low
  - **low**: exploratory; not yet reliable

## Supported Harness:Model Combinations

### pi:ollama/granite4.2:3b

**Required run flags**: `effort: off`, `--lean-prompt`

2026-10-08 new-model bench: pi+granite4.2:3b is high on all three tasks with effort=off and --lean-prompt. Prefer over little-coder when both qualify (pi is substantially faster on this box). Model in ~/.pi/agent/models.json.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20261008-203623](../runs/20261008-203623), [20261008-210347](../runs/20261008-210347), [20261008-212736](../runs/20261008-212736) | 2026-10-08 3/3 obj+arena; faster than little-coder. Require effort=off and --lean-prompt. |
| `extract_structured` | high | [20261008-203659](../runs/20261008-203659), [20261008-210415](../runs/20261008-210415), [20261008-212804](../runs/20261008-212804) | 2026-10-08 3/3 obj+arena. Require effort=off and --lean-prompt. |
| `rewrite_short_prose` | high | [20261008-203719](../runs/20261008-203719), [20261008-210600](../runs/20261008-210600), [20261008-212832](../runs/20261008-212832) | 2026-10-08 3/3 obj+arena. Require effort=off and --lean-prompt. |

### pi:ollama/qwen3.5:4b

**Required run flags**: `effort: off`, `--lean-prompt`

2026-10-08 new-model bench: pi+qwen3.5:4b is high on all three tasks ONLY with thinking off (-e off / model@off) and --lean-prompt. Keep opencode+qwen3.5:4b@none not_suitable until separately re-proven.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20261008-204100](../runs/20261008-204100), [20261008-210852](../runs/20261008-210852), [20261008-213201](../runs/20261008-213201) | 2026-10-08 3/3 obj+arena. thinking/effort MUST be off (-e off / @off); --lean-prompt required. Supersedes the 2026-09-29 opencode KEEP_OFF for this model on *pi only*. |
| `extract_structured` | high | [20261008-204136](../runs/20261008-204136), [20261008-210917](../runs/20261008-210917), [20261008-213238](../runs/20261008-213238) | 2026-10-08 obj 3/3, arena 2/3 (210917 wrote lowercase solution.md — objective PASS, arena missed SOLUTION.md). Still meets high bar on usable content. Require effort=off and --lean-prompt. |
| `rewrite_short_prose` | high | [20261008-204248](../runs/20261008-204248), [20261008-210945](../runs/20261008-210945), [20261008-213310](../runs/20261008-213310) | 2026-10-08 3/3 obj+arena. Require effort=off and --lean-prompt. |

### little-coder:ollama/granite4.2:3b

**Required run flags**: `effort: off`, `--lean-prompt`

2026-10-08 new-model bench on harness-arena@e529fbe: first local cell that clears confidence_for_auto_route: high on tip-class arena across all three tasks. Always route with effort=off (-e off / @off) and --lean-prompt. Model must be listed in little-coder-models.json.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20261008-203150](../runs/20261008-203150), [20261008-205258](../runs/20261008-205258), [20261008-211518](../runs/20261008-211518) | 2026-10-08 new-model bench 3/3 obj+arena (16k ctx, -e off, --lean-prompt). Require effort=off and --lean-prompt. |
| `extract_structured` | high | [20261008-203326](../runs/20261008-203326), [20261008-205414](../runs/20261008-205414), [20261008-211723](../runs/20261008-211723) | 2026-10-08 3/3 obj+arena. LC extract can sit near the 480s cell timeout edge but still PASSed. Require effort=off and --lean-prompt. |
| `rewrite_short_prose` | high | [20261008-203451](../runs/20261008-203451), [20261008-210219](../runs/20261008-210219), [20261008-212528](../runs/20261008-212528) | 2026-10-08 3/3 obj+arena. Require effort=off and --lean-prompt. |

### little-coder:ollama/qwen3.5:4b

**Required run flags**: `effort: off`, `--lean-prompt`

Raised medium→high on 2026-10-08 after harness-arena #17 (fccad9d) changed cell confinement to judge where a write landed. Replaying the 9 bench cells under merged master d44b94d: obj 9/9, arena 9/9, 0 escapes, host paths absent. That matches granite4.2:3b (9/9) and beats pi+qwen3.5:4b (8/9). The rating needs an arena with landing-path confinement (>= fccad9d); older arenas falsely fail these cells. Listed after pi+granite, so it only wins when that pair is unavailable. Always use effort=off and --lean-prompt.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | high | [20261008-203743](../runs/20261008-203743), [20261008-210624](../runs/20261008-210624), [20261008-212857](../runs/20261008-212857), [20261008-225605](../runs/20261008-225605) | Obj 3/3; arena 3/3 under harness-arena@d44b94d. The model asks for /fizz.py and little-coder writes <cell>/fizz.py. The arena now checks the landing path (#17), so these runs pass. Live re-run 20261008-225605 also PASSed 1.00. Require effort=off and --lean-prompt. |
| `extract_structured` | high | [20261008-203856](../runs/20261008-203856), [20261008-210740](../runs/20261008-210740), [20261008-213025](../runs/20261008-213025) | Obj 3/3; arena 3/3 under d44b94d (remapped /result.json, /SOLUTION.md). Require effort=off and --lean-prompt. |
| `rewrite_short_prose` | high | [20261008-203932](../runs/20261008-203932), [20261008-210816](../runs/20261008-210816), [20261008-213101](../runs/20261008-213101) | Obj 3/3; arena 3/3 under d44b94d (210816 remapped /rewrite.md). Require effort=off and --lean-prompt. |

### opencode:ollama/qwen2.5:3b-instruct

2026-10-05 weekly rebench on harness-arena@834d891: demoted tiny_code high→medium; extract_structured and rewrite_short_prose high→not_suitable (tip objective 0/3 and 0/2). Outranked for auto-route by granite4.2:3b and pi+qwen3.5:4b promotions (2026-10-08). Prior lean KEEP_OFF for opencode+lean (20261001-151618) unchanged; never force --lean-prompt here.

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

Keep weak. 2026-10-08 baseline LC qwen2.5:3b-instruct: 1/9 overall (one fizz PASS). extract_structured and rewrite_short_prose stay not_suitable. tiny_code_snippet remains provisional lean-only (n small, hang risk).

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | provisional | [20261001-145407](../runs/20261001-145407), [20261008-211029](../runs/20261008-211029) | Lean-only provisional / at best low. 2026-10-08 baseline rebench: 1/3 fizz (211029), 0/3 extract, 0/3 rewrite — empty assistant turns and runaway stdout, consistent with the 2026-10-05 demotion. Gate on timeout + objective check. Without lean: still empty {} / do not route. |

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

KEEP_OFF / do not promote (unchanged). Prior recheck 20261001-075532: degraded, no files, tool-as-text. Not re-run in 2026-10-08 new-model bench. pi+qwen3.5:4b@off is the promoted path for this model.

#### Not Suitable For

- `tiny_code_snippet`
- `*`

### opencode:ollama/qwen2.5:0.5b

Too small for arena contract + tool loop; do not route.

#### Not Suitable For

- `tiny_code_snippet`
- `*`

### little-coder:ollama/minicpm5-2b-16k:2b

2026-10-08 new-model bench: mostly 480s timeouts with no writes; occasional stray writes under the runs root. not_suitable. Derived tag from openbmb/minicpm5-2b:2b with num_ctx 16384.

#### Not Suitable For

- `tiny_code_snippet`
- `extract_structured`
- `rewrite_short_prose`
- `*`

### pi:ollama/minicpm5-2b-16k:2b

2026-10-08: mostly timeouts / stray writes. tiny_code optional low (n=1); extract/rewrite not_suitable. Do not promote.

#### Task Types

| Task Type | Confidence | Evidence | Notes |
|-----------|------------|----------|-------|
| `tiny_code_snippet` | low | [20261008-211406](../runs/20261008-211406) | 2026-10-08: 1/3 fizz PASS (211406); do not auto-route. n=1. |

#### Not Suitable For

- `extract_structured`
- `rewrite_short_prose`
- `*`

## Task Type Taxonomy

Current task types supported across all harnesses:

- `extract_structured`
- `rewrite_short_prose`
- `tiny_code_snippet`

**Not suitable for local LLMs yet**: multi-file refactor, security review, architecture design, long context research, complex debugging, tool-heavy agent loops

---

*Generated from `capabilities.yaml`. To update, edit capabilities.yaml and run `npm run render-capabilities`.*
