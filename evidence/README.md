# Evidence Directory

This directory holds **evidence** for capability map promotions: judgment notes and links to harness-arena evaluation runs.

## Purpose

The capability map (`capabilities.yaml`) is the source of truth for which `{harness, model}` pairs can handle which task types at which confidence levels. Every claim requires evidence from harness-arena runs that meet the quality bar.

## Quality Bar for Promotion

**IMPORTANT**: `confidence: high` requires evidence. Do not mark entries as `high` with empty evidence arrays.

To promote a task type to `high` confidence in `capabilities.yaml`:

1. **PASS ≥ 0.9** on the harness-arena rubric
2. **≥2 independent arena runs** (different prompts or dates)
3. **Human/agent review note** filed in this directory
4. **Add run IDs** to the `evidence: [...]` array

Use `medium` for preliminary positive signals or PASS ≥ 0.7 (evidence-backed). Use `provisional` for promising task types that haven't been fully evaluated yet — it ranks **below** `medium` and does not meet `require_confidence: medium`. Use `low` for exploratory work. Routing preference: high > medium > provisional > low.

## Workflow (Dogfooding Team)

1. **Run Evaluation**
   ```bash
   ./arena run --harness opencode --model ollama/qwen2.5:3b-instruct --task-type tiny_code_snippet
   ```

2. **Check Results**
   - Review `runs/<run-id>/` for output, rubric score, and PASS/FAIL
   - If PASS < 0.9, investigate failure modes (don't promote)

3. **File Judgment Note**
   - Create `evidence/<harness>-<model>-<task-type>.md`
   - Include:
     - Run IDs
     - PASS scores
     - Key observations (correctness, edge cases, quality)
     - Recommendation (promote to high/medium/low, or not suitable)

4. **Update Capability Map**
   - Edit `capabilities.yaml`
   - Add run IDs to `evidence: [...]` array for the task type
   - Update `confidence:` if promoting
   - Update `notes:` with brief summary

5. **Regenerate Table**
   ```bash
   npm run render-capabilities
   ```

6. **Commit Changes**
   ```bash
   git add capabilities.yaml CAPABILITIES.md evidence/
   git commit -m "evidence: promote <harness>:<model> <task-type> to <confidence>"
   ```

## Evidence File Template

Create `evidence/<harness>-<model>-<task-type>.md`:

```markdown
# <harness>:<model> — <task_type>

## Run IDs
- `run-2026-09-29-abc123` — PASS 0.95
- `run-2026-09-30-def456` — PASS 0.92

## Observations
- Correctly handles simple cases (hello world, basic functions)
- Clean code formatting
- Follows spec instructions accurately
- Edge case: struggled with complex imports (1 of 10 runs)

## Recommendation
Promote to **high confidence** for simple single-file code tasks.

## Reviewer
@username, 2026-09-29
```

## Notes

- **Do not fabricate run IDs**: Only add runs that actually executed and met the quality bar
- **Demotion is OK**: If a re-bench fails, reduce confidence or move to `not_suitable`
- **Document failures**: If a task type doesn't work, file a note explaining why
- **Version history**: Git tracks changes; no need for inline version history in evidence files

---

**Owner**: Dogfooding team  
**Contact**: For questions about evidence promotion, file an issue or contact the Dogfooding team lead.
