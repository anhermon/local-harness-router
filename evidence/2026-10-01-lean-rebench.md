# Lean-prompt rebench — LHR map update (2026-10-01)

**When:** 2026-10-01 ~14:53–15:18 IDT (Asia/Jerusalem)  
**Arena tip:** `anhermon/harness-arena` @ `834d891` (PR #11 — `--lean-prompt`)  
**Model (unless noted):** `ollama/qwen2.5:3b-instruct`  
**Gate:** `arena-daily check` objective files (not skeleton PASS)  
**Source dogfood note:** harness-arena-daily-driver `evidence/LEAN-REBENCH-2026-10-01.md`  
**Engineering ping:** `ENGINEERING_PING.md` (dogfood did not edit LHR)

## Quality bar applied

- Promote to **high** only with PASS ≥ 0.9, ≥2 independent runs, review note, and objective usable artifacts.
- This rebench yields **one** objective PASS for little-coder+lean → map as **provisional** (promote-with-notes), not high.
- Arena skeleton PASS alone is insufficient (same policy as `2026-09-29-dogfood.md`).

## PROMOTE_CANDIDATE (provisional)

### `little-coder` + `ollama/qwen2.5:3b-instruct` + **lean-prompt only** → `tiny_code_snippet`

| Run id | Arena | Objective check | Notes |
|--------|-------|-----------------|-------|
| `20261001-145407` | `done` (after SIGKILL of hung LC) | **PASS** | First objective PASS for LC on this box (prior non-lean: empty `{}`) |

**Lean contract:** short system + lean contract / `LITTLE_CODER_PROJECT_CONTEXT=0` (`--lean-prompt` on tip).

**Ops caveats (encoded in map notes — do not hide):**

- Agent wrote files then **hung** ~16 min (ollama “Stopping…”); needed **SIGTERM/SIGKILL** for arena to finalize.
- `hello.py` was `print('hello world\n')` — compiles and prints hello world + extra newline (not exact one-liner); objective check still PASS.
- `_stdout.txt` ~56 MiB (JSONL flood) — hang / log hygiene risk.
- Gate on **timeout + objective check**, not skeleton PASS.

**Recommendation:** `confidence: provisional` for `tiny_code_snippet` **only with lean-prompt** (or equivalent). Do not auto-route at `require_confidence: high`. Do not blanket-promote LC without lean.

## KEEP_OFF / do not promote

| Combo | Run id | Why |
|-------|--------|-----|
| `pi` + `qwen2.5:3b-instruct` + lean | `20261001-151107` | Wrote `hello.py`/`SOLUTION.md` to **run root**, not cell cwd; objective FAIL; hung → SIGTERM |
| `opencode` + `qwen2.5:3b-instruct` + lean | `20261001-151618` | Degraded ~17s; garbage text; no tools/files — **worse** than default |
| `opencode` + `qwen3.5:4b@none` | `20261001-075532` (prior; not re-run) | No files / tool-as-text — unchanged KEEP_OFF |

## Leave alone (already good)

| Combo | Run id | Note |
|-------|--------|------|
| `opencode` + `qwen2.5:3b-instruct` **without** lean | `20261001-151648` | Objective PASS on tip `834d891` — keep as proven daily path; **do not** force `--lean-prompt` |

Prior high promotions for extract/rewrite on this cell remain unchanged.

## Map actions taken in this PR

1. `little-coder:ollama/qwen2.5:3b-instruct` — add `tiny_code_snippet` at **provisional** with lean-only caveats; remove from blanket `not_suitable` / `*`.
2. `opencode:ollama/qwen2.5:3b-instruct` — append control run `20261001-151648`; note lean KEEP_OFF / do not force lean.
3. Add KEEP_OFF entries: `pi:ollama/qwen2.5:3b-instruct`, `opencode:ollama/qwen3.5:4b@none`.
4. Point `arena.checkout` at `harness-arena@834d891`.

## Reviewer

Engineering (executor), from Dogfooding lean-prompt rebench ping, 2026-10-01 IDT.
