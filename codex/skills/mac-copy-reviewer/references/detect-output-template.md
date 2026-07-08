# Detect mode — output template

Detect mode flags AI patterns without rewriting. Render exactly two sections.

---

## Section 1 — Issues found

Group by severity, P0 first, then P1, then P2. Omit a severity group that has no
findings. For each finding:

```
[P0] ai_pattern — "exact quoted text from the source"
  Pattern: <pattern_name>
  Why: <plain-English explanation>
  Fix: <suggested fix from the rubric>
```

Severity badges: `P0` (blocking), `P1` (clear problem), `P2` (judgment call).
Category is one of `ai_pattern`, `factual`, `voice`, `persona`.

Example:

```
### Issues found

[P1] ai_pattern — "leverage"
  Pattern: tier_1_vocabulary
  Why: High-signal AI vocabulary; humans rarely write "leverage" as a verb.
  Fix: Use: use

[P1] ai_pattern — "serves as a unified hub"
  Pattern: copula_avoidance
  Why: Avoids the plain verb "is"; a machine tell.
  Fix: Replace with a direct verb (e.g. "is a hub").

[P2] voice — hedging
  Pattern: opinion_strength
  Why: "Arguably" weakens the stated position.
  Fix: State and defend a position; cut the hedge.
```

---

## Section 2 — Assessment

```
### Assessment

Clear problems (P0/P1 — unambiguously need fixing):
- <one line per clear problem>

Judgment calls (P2 — may be intentional or defensible):
- <one line per judgment call>

Dimension scores:
- AI-pattern:        X/10
- Factual quality:   X/10
- Voice fidelity:    X/10
- Persona resonance: X/10
- Overall writing quality: X/10

<If rewrite threshold met — 5+ tier-1 flags AND 3+ pattern categories AND
uniform rhythm:>
Full rewrite recommended. The structure itself is AI-generated. State the core
point in one sentence, then rebuild.
```

All dimension scores are 0–10. Overall is the bundle score × 10.

The mapping from the `run_detect()` return dict:

- `section_1_issues_found` → `{P0:[...], P1:[...], P2:[...]}`
- `section_2_assessment.clear_problems` → P0 + P1 findings
- `section_2_assessment.judgment_calls` → P2 findings
- `section_2_assessment.dimension_scores` → the five scores above
- `section_2_assessment.rewrite_recommendation_text` → the rewrite-threshold line
  (present only when triggered)
