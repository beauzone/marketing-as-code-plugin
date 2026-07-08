# Revision instructions schema (grader-loop contract)

When any review mode scores below the 70% publish threshold, the engine emits a
structured `revision_instructions` block in the returned dict. It is **not shown
to the user** — it is the machine-readable contract consumed by the BEA-65
grader loop to drive the next revision pass.

Produced by `skills/_shared/copy_reviewer.py::build_revision_instructions(bundle)`.

## Schema

```json
{
  "threshold_met": false,
  "overall_score": 0.64,
  "dimension_failures": [
    {
      "dimension": "ai_pattern",
      "score": 5.2,
      "priority_fixes": [
        {
          "pattern": "copula_avoidance",
          "location": "paragraph 3",
          "quoted": "serves as a unified hub",
          "fix": "Replace with a direct verb: is a hub"
        },
        {
          "pattern": "tier_1_vocabulary",
          "location": "document",
          "quoted": "leverage",
          "fix": "Use: use"
        }
      ]
    },
    {
      "dimension": "voice_fidelity",
      "score": 5.8,
      "priority_fixes": [
        {
          "subdimension": "opinion_strength",
          "issue": "No position taken on X in paragraph 4",
          "fix": "State and defend a position"
        }
      ]
    }
  ],
  "rewrite_threshold_triggered": false,
  "recommended_action": "targeted_revision"
}
```

## Field reference

| Field | Type | Meaning |
|---|---|---|
| `threshold_met` | bool | `overall_score >= 0.70`. When the block is emitted this is `false`. |
| `overall_score` | float 0.0–1.0 | Normalized writing-quality bundle score. |
| `dimension_failures` | list | One entry per dimension scoring below 7.0/10. |
| `dimension_failures[].dimension` | string | `ai_pattern` / `factual` / `voice_fidelity` / `persona`. |
| `dimension_failures[].score` | float 0–10 | The dimension's score. |
| `dimension_failures[].priority_fixes` | list | P0/P1 findings to fix first. |
| `rewrite_threshold_triggered` | bool | True when 5+ tier-1 flags AND 3+ pattern categories AND uniform rhythm. |
| `recommended_action` | string | `full_rewrite` when the rewrite threshold tripped, else `targeted_revision`. |

## priority_fixes shapes

- **ai_pattern / factual / persona dimensions** use the pattern shape:
  `{pattern, location, quoted, fix}` (factual/persona may use `{pattern, issue, fix}`).
- **voice_fidelity** uses the subdimension shape:
  `{subdimension, issue, fix}`.

## Consumer notes

- The grader loop reads `recommended_action` first: `full_rewrite` means discard
  and rebuild; `targeted_revision` means patch the listed `priority_fixes`.
- After applying fixes, the grader re-scores. The loop ceiling is resolved by
  `model_router.get_effective_cycle_limit()` (system hard cap of 3).
- In rewrite mode the block reflects the **post-rewrite** state — i.e. what still
  needs work after the first heuristic/LLM pass.
