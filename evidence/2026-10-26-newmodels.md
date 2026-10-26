# New-model bench — 2026-10-26

**When:** 2026-10-26 10:12–11:20 (Asia/Jerusalem)  
**Source:** Dogfooding `/workspace/bench-2026-10-26-newmodels/RESULTS.md` (matrix, run logs, `check-spark.txt`, `check-k2.txt`); candidates from `research-2026-10-26-landscape.md`.  
**Arena:** local clone of harness-arena@`8ac4683` (PR #23 merged), bench server, `ARENA_SPEC_GEN=off` (arena grading is the file-level fallback; the objective `check.py` result is the score), `ARENA_SANDBOX_NET=local`, 480 s cell timeout.  
**Matrix:** 3 rounds × {fizz / tiny_code, extract, rewrite} × {pi, little-coder} per model.  
**Cell flags:** `OLLAMA_CONTEXT_LENGTH=16384`, `-e off`, `--lean-prompt`, `-t code`. Local only: guard stubs for claude/codex/agy/gemini/cursor-agent logged 0 calls.  
**Unchanged:** granite4.2:3b and qwen3.5:4b were not rerun; their 2026-10-08 ratings stand.

## Results (objective `check.py` / arena)

| Model | Harness | fizz | extract | rewrite | Total | Wall |
|---|---|---|---|---|---|---|
| hf.co/IFM/K2-Horizon-7B-GGUF:Q4_K_M | pi | 3/3 | 3/3 | 3/3° | 9/9 | 20–65 s |
| hf.co/IFM/K2-Horizon-7B-GGUF:Q4_K_M | little-coder | 3/3 | 3/3 (1 at timeout\*) | 3/3 | 9/9 | 44–93 s, +1 timeout |
| SparkLLM/Spark-X2.6-4B (BF16) | pi | 3/3 | 3/3 | 0/3¶ | 6/9 | 24–85 s |
| SparkLLM/Spark-X2.6-4B (BF16) | little-coder | 3/3 (128–145 s) | 3/3 (1 at timeout\*) | 2/3 (1 timeout, no file) | 8/9 | 68–482 s |

Run IDs are `20261026-` + six digits and are listed per task on each capability entry.
\* 105952 (K2) and 101817 (Spark) wrote correct files, then the little-coder loop ran to the 480 s cell timeout (status `failed`, files PASS).
° 111528: 39 words, starts "Dear [Name]," — passes the check, but contains a placeholder.
¶ pi + Spark on rewrite emits its tool calls as text (`<invoke name="write">…`) and writes no files.

## Map actions

| Model | Harness | tiny_code_snippet | extract_structured | rewrite_short_prose |
|---|---|---|---|---|
| K2-Horizon-7B Q4_K_M | pi | high | high | high (watch placeholders) |
| K2-Horizon-7B Q4_K_M | little-coder | high | medium (timeout edge) | high |
| Spark-X2.6-4B | pi | high | high | not_suitable |
| Spark-X2.6-4B | little-coder | medium (slow) | medium (timeout) | low, provisional |

- New entries are listed after the 2026-10-08 entries, so routing for existing task types is unchanged (pi+granite4.2:3b still selected first).
- **K2-Horizon-7B uses 8.4 GB loaded** (39/61 CPU/GPU) versus 3.8/4.2 GB for granite/qwen: load it on its own. It needs Ollama ≥ 0.40.4 (benched on 0.40.11).
- **Spark-X2.6-4B** is only published as BF16 (8.6 GB, 100% CPU on this box, about 4.6 tok/s). Not a daily driver.
- **Both harnesses** need the model registered before these routes work: in `~/.pi/agent/models.json` for pi, and in harness-arena's `little-coder-models.json` for little-coder. The bench used bench-only copies of both.

## Not benched

- `nemotron-3.5-bolt:e4b`: the pull failed on this box (Ollama 0.40.11 refuses the blob redirect behind the box's fake-IP DNS; 0.34.4 is refused by the registry). Untested; not rated.

## Reviewer

Engineering (executor), from Dogfooding's 2026-10-26 results. Needs Dogfooding review before merge.
