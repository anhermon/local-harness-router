# Weekly rebench — 2026-10-05 08:52–09:12 IDT (tip `834d891` vs old `a03fe02`)

**When:** 2026-10-05 ~08:52–09:12 IDT (Asia/Jerusalem)  
**Arena tip:** `/workspace/harness-arena-daily-driver/repo` @ `834d891` (= GitHub HEAD), `:5190`, runs in `/workspace/harness-arena-daily-driver/runs`.  
**A/B control:** `/workspace/harness-arena-working` @ `a03fe02` (the checkout the 09-29 promotions came from), `:5188`, runs in `runs-dogfood/`.  
**Cell:** `opencode:ollama/qwen2.5:3b-instruct`, `-t code`, default (non-lean) prompt, serialized.  
**Models on box:** `qwen2.5:3b-instruct`, `qwen2.5:0.5b`, `qwen3.5:4b`, `qwen3.5:4b-fast` (alias of same 4b weights from 09-29 Modelfile experiments, not a new model, so no exploratory type run). Ollama was down at start and was restarted.  
**Source:** Dogfooding `ENGINEERING_PING-2026-10-05.md` + daily-driver `EVIDENCE.md` top section. Dogfooding opened every output file and did not rely on the arena PASS.

## Quality bar applied

- Promote / keep **high** only with PASS ≥ 0.9, ≥2 independent runs, review note, and objective usable artifacts.
- Arena skeleton PASS alone is insufficient (same policy as `2026-09-29-dogfood.md`).
- Ratings below for map demotions cite **tip `834d891`** runs (what the router actually runs). A/B `a03fe02` runs are labeled as such and are comparison-only.

## Run table

| Run id | Checkout | Task | Arena | Objective check |
|--------|----------|------|-------|-----------------|
| `20261005-085227` | tip `834d891` | tiny_code (fizz(n), new prompt) | PASS 0.67 | **FAIL**: `fizz.py` wrapped in markdown `python` fences → SyntaxError (tip compile criterion caught it) |
| `20261005-090323` | tip `834d891` | tiny_code (09-29 hello prompt) | PASS 1.00 | PASS: `hello.py` = `print('hello world')`; SOLUTION.md placeholder |
| `20261005-085404` | tip `834d891` | extract (new prompt, Dana Levi) | FAIL 0.00 | **FAIL**: zero files, no text/tool parts |
| `20261005-090439` | tip `834d891` | extract (09-29 Nocturne prompt) | FAIL 0.00 | **FAIL**: write call emitted as `<XML>` text; no files |
| `20261005-091017` | tip `834d891` | extract (Nocturne, repeat) | FAIL 0.00 | **FAIL**: write call as `<XML>` text, JSON fenced; no files |
| `20261005-090729` | `a03fe02` | extract (Nocturne) | PASS 1.00 | PASS: `result.json` exact match |
| `20261005-091057` | `a03fe02` | extract (Nocturne, repeat) | PASS 1.00 | **FAIL**: valid object followed by trailing prose → invalid JSON |
| `20261005-085512` | tip `834d891` | rewrite (new prompt, review postpone) | FAIL 0.00 | **FAIL**: wrote `rewrite.md`/`SOLUTION.md` to `/workspace/harness-arena-daily-driver/` (outside cell; quarantined to `evidence/misplaced-20261005-085512/`); text barely rewritten |
| `20261005-090523` | tip `834d891` | rewrite (09-29 picnic prompt) | PASS 1.00 | **FAIL**: rewrite says "canceled" (meaning changed) and `rewrite.md` polluted with a `**SOLUTION.md**` line; SOLUTION.md word count wrong |
| `20261005-090829` | `a03fe02` | rewrite (picnic) | PASS 1.00 | PASS: 17-word rewrite, keeps "rescheduled" meaning (SOLUTION.md count wrong, ignored) |

## Verdict on tip `834d891` (map actions)

- `tiny_code_snippet` → **demote high → medium.** Hello one-liner still works (`20261005-090323`); a 5-line function came back markdown-fenced and does not compile (`20261005-085227`). Trivial one-liners only.
- `extract_structured` → **demote high → not_suitable.** Tip 0/3 (`20261005-085404`, `20261005-090439`, `20261005-091017` — two tool-as-text). Old checkout `a03fe02` 1/2 this week (`20261005-090729` exact; `20261005-091057` trailing prose).
- `rewrite_short_prose` → **demote high → not_suitable.** Tip 0/2 (`20261005-085512` write outside cell; `20261005-090523` meaning change + file pollution). Old checkout `a03fe02` 1/1 (`20261005-090829`).
- Net: nothing local meets `confidence_for_auto_route: high` on tip this week — router should fall to reject-default for these.

## Hunch for Engineering (unverified, n is small)

Tip and `a03fe02` differ in the contract suffix (tip lists every mandated file, e.g. "`SOLUTION.md`, `result.json` … other named files must implement the task"). Same prompts did better on `a03fe02`. Could be 3B variance; could be the longer multi-file contract nudging the model into tool-as-text. Also one opencode write landed outside the cell cwd on tip (`20261005-085512`). Success criterion suggested by Dogfooding: same three 09-29 prompts objective-PASS ≥2/3 each on tip.

## Reviewer

Engineering (executor), from Dogfooding weekly rebench ping, 2026-10-05 IDT. Dogfooding will re-run and LGTM once a PR lands.
