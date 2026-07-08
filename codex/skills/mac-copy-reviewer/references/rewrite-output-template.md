# Rewrite mode — output template

Rewrite mode flags, fixes, and runs a second-pass audit. Render exactly four
sections.

---

## Section 1 — Issues found

Identical format to detect mode Section 1 (see `detect-output-template.md`):
findings grouped by severity, each with a badge, category, quoted text, pattern
name, plain-English reason, and suggested fix.

---

## Section 2 — Rewritten version

The clean copy with all AI-isms addressed.

- If the rewrite threshold triggered (`rewrite_threshold_triggered: true`):
  a full rewrite from scratch. State the core point in one sentence, then
  rebuild.
- Otherwise: targeted patching of the flagged passages only.

The rewrite must read specific, direct, and human — not AI-with-buzzwords-
removed. Replace vague claims with concrete ones; take a position where the
original hedged.

---

## Section 3 — What changed

Bulleted summary referencing **specific pattern names**, not generic
descriptions. Examples:

```
- Removed 3 tier-1 vocabulary violations (leverage → use, paradigm → approach, seamless → smooth)
- Repaired copula avoidance in paragraph 2 ("serves as a hub" → "is a hub")
- Strengthened opinion in paragraph 4 — original took no position; rewrite states it directly
- Cut generic conclusion ("the future looks bright") and replaced with a specific forward claim
```

Maps to `section_3_what_changed` (a list of strings).

---

## Section 4 — Second-pass audit

Re-read the rewritten version, run pattern detection again, and report:

```
### Second-pass audit

Surviving violations: <none | list with inline fixes>

Dimension scores after rewrite:
- AI-pattern:        X/10
- Factual quality:   X/10
- Voice fidelity:    X/10
- Persona resonance: X/10
- Overall:           X/10

Verdict: pass | hold | revise   (against the 70% publish threshold)
```

Maps to `section_4_second_pass_audit`:

- `surviving_findings` → `{P0:[...], P1:[...], P2:[...]}`
- `dimension_scores` → the five post-rewrite scores
- `verdict` → `publish` / `hold` / `revise`
- `publish_blocked` → bool

When the post-rewrite overall is still below 70%, the returned dict also carries
`revision_instructions` for the grader loop (not shown to the user).
