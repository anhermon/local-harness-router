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

Run IDs are `20261008-` + six digits. † lowercase `solution.md`. ‡ The model passed absolute paths like `/fizz.py`, and little-coder wrote them into the cell; host `/fizz.py` does not exist. These were false confinement FAILs on `e529fbe`. They PASS under harness-arena #17 (`fccad9d`); see the re-evaluation below.

## Map actions

- **Promote high:** `little-coder`+`granite4.2:3b`, `pi`+`granite4.2:3b`, `pi`+`qwen3.5:4b` on `tiny_code_snippet` / `extract_structured` / `rewrite_short_prose`. Router prefers pi (listed first) when confidence ties — faster on this box.
- **High (re-rated after #17, see below):** `little-coder`+`qwen3.5:4b` on the same three. First rated medium because of false confinement FAILs on remapped `/fizz.py`.
- **Keep weak:** baseline LC `qwen2.5:3b-instruct` (provisional lean-only tiny_code; extract/rewrite not_suitable).
- **not_suitable:** `minicpm5-2b-16k:2b` on little-coder; pi extract/rewrite. pi tiny_code optional **low** (n=1).
- **Unchanged KEEP_OFF:** `opencode`+`qwen3.5:4b@none`, `pi`+`qwen2.5:3b-instruct`, `opencode`+`qwen2.5:0.5b`.

## Required run flags

Every 2026-10-08 promotion was proven with `-e off` and `--lean-prompt`. Capability entries carry `effort: off` and `lean_prompt: true`; `local-route` prints them and the execute-hint uses `./arena run … -c harness:model@off --lean-prompt`.

## Reviewer

Engineering (executor), from Dogfooding new-model bench ping, 2026-10-08 IDT. #8, harness-arena #17 and #18 were LGTM'd by Dogfooding and merged.

## Re-evaluation: little-coder + qwen3.5:4b after harness-arena #17 (2026-10-08, ~23:10 IDT)

harness-arena #17 (`fccad9d`) changed confinement to judge where a write landed. It accepts little-coder's `/<name>` → `<cell>/<name>` remap only with proof: the end result names that exact path, it is a regular file in the cell, and nothing exists at the host path. I replayed the 9 bench arena cells under merged master `d44b94d`:
- confinement: `findOutOfCellWrites` run on the real cell dirs;
- grade: `evals.js grade()` run on scratch copies against each run's `eval.json`.

| Task | Runs | Objective | Arena on d44b94d | Escapes | Proven remaps |
|------|------|-----------|------------------|---------|---------------|
| tiny_code (fizz) | 203743 210624 212857 | 3/3 | **3/3** (score 1) | 0 | 6 |
| extract | 203856 210740 213025 | 3/3 | **3/3** (score 1) | 0 | 6 |
| rewrite | 203932 210816 213101 | 3/3 | **3/3** (score 1) | 0 | 2 |

The same replay on the comparators gives granite4.2:3b LC 9/9, granite4.2:3b pi 9/9, and qwen3.5:4b pi 8/9 (210917, lowercase `solution.md`). LC qwen3.5 therefore meets the bar granite and pi+qwen3.5 were promoted on, and is raised to **high** on all three tasks.

Supporting evidence:
- Live re-run `20261008-225605` on a scratch #17+#18 arena (real little-coder, 16k): **PASS 1.00**, `remappedWrites` = `/fizz.py`, `/SOLUTION.md`. Run data is in Dogfooding's `lhr-newmodels-lgtm-2026-10-08/runs-real/`.
- Host `/fizz.py`, `/SOLUTION.md`, `/result.json` and `/rewrite.md` are absent.

Caveat: the rating requires harness-arena ≥ `d44b94d`. Arenas before #17 (`fccad9d`) falsely fail these cells, and before #18 (`d44b94d`) little-coder has no `ollama/qwen3.5:4b` entry in `little-coder-models.json`.

