# New-model landscape — 2026-10-08

**When:** 2026-10-08 (Asia/Jerusalem)  
**Arena tip:** harness-arena@`e529fbe` (#13 compile-gate tip; confinement from #12)  
**Matrix:** 3 rounds × {granite4.2:3b, qwen3.5:4b, minicpm5-2b-16k:2b} × {little-coder, pi} × {fizz/tiny_code, extract, rewrite}, plus baseline `little-coder:ollama/qwen2.5:3b-instruct`.  
**Cell flags:** Ollama `OLLAMA_CONTEXT_LENGTH=16384`; new models used `-e off` + `--lean-prompt` + `-t code`; baseline LC used lean without `@off`.  
**Source:** Dogfooding `ENGINEERING_PING-2026-10-08-newmodels.md` + `/workspace/newmodel-bench-2026-10-08/REPORT.md`.

## Quality bar applied

- Promote **high** only with PASS ≥ 0.9, ≥2 independent runs, review note, and objective usable artifacts.
- Arena skeleton PASS alone is insufficient.
- Effort / lean flags that the bench used are recorded on the capability entry (`effort: off`, `lean_prompt: true`) so the router surfaces them.

## Headline scores (objective / arena)

| Model | Harness | Task | Score (obj/arena) | Run IDs |
|------|---------|------|-------------------|---------|
| granite4.2:3b | little-coder | fizz / extract / rewrite | **3/3** each | 203150 205258 211518 / 203326 205414 211723 / 203451 210219 212528 |
| granite4.2:3b | pi | fizz / extract / rewrite | **3/3** each | 203623 210347 212736 / 203659 210415 212804 / 203719 210600 212832 |
| qwen3.5:4b | pi | fizz / rewrite | **3/3**; extract obj 3/3 arena 2/3 | 204100 210852 213201 / 204248 210945 213310 / 204136 210917† 213238 |
| qwen3.5:4b | little-coder | fizz / extract | obj 3/3 arena 0/3‡; rewrite obj 3/3 arena 2/3 | 203743 210624 212857 / 203856 210740 213025 / 203932 210816 213101 |
| qwen2.5:3b-instruct (baseline LC) | little-coder | fizz / extract / rewrite | 1/3 / 0/3 / 0/3 | 211029 only PASS |
| minicpm5-2b-16k:2b | little-coder / pi | * | not_suitable (timeouts / stray); pi tiny_code 1/3 | 211406 only pi fizz PASS |

Run IDs are `20261008-` + six digits. † lowercase `solution.md`. ‡ absolute-path tool args remapped into the cell by little-coder; host `/fizz.py` does not exist — arena confinement over-strict until harness-arena #17.

## Map actions

- **Promote high:** `little-coder`+`granite4.2:3b`, `pi`+`granite4.2:3b`, `pi`+`qwen3.5:4b` on `tiny_code_snippet` / `extract_structured` / `rewrite_short_prose`. Router prefers pi (listed first) when confidence ties — faster on this box.
- **Medium (capped):** `little-coder`+`qwen3.5:4b` on the same three — content is high (obj 9/9) but arena confinement false-positives on remapped `/fizz.py`. Re-rate toward high after harness-arena landing-path confinement (#17) lands.
- **Keep weak:** baseline LC `qwen2.5:3b-instruct` (provisional lean-only tiny_code; extract/rewrite not_suitable).
- **not_suitable:** `minicpm5-2b-16k:2b` on little-coder; pi extract/rewrite. pi tiny_code optional **low** (n=1).
- **Unchanged KEEP_OFF:** `opencode`+`qwen3.5:4b@none`, `pi`+`qwen2.5:3b-instruct`, `opencode`+`qwen2.5:0.5b`.

## Required run flags

Every 2026-10-08 promotion was proven with `-e off` and `--lean-prompt`. Capability entries carry `effort: off` and `lean_prompt: true`; `local-route` prints them and the execute-hint uses `./arena run … -c harness:model@off --lean-prompt`.

## Reviewer

Engineering (executor), from Dogfooding new-model bench ping, 2026-10-08 IDT. Dogfooding will re-LGTM once this PR and harness-arena #17 land.
