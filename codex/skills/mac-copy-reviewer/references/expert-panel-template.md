# Expert-panel mode — output template

Expert-panel mode reviews content as a target persona, then produces a targeted
rewrite that closes the gaps that persona cares about. Render exactly two
sections.

---

## Section 1 — [Persona name] review

Header line:

```
Reviewing as [Persona Name], [Title] at [Company Type]
```

For each of the persona's characteristic questions (from
`wr-persona-resonance.yaml` `persona_reviewer_questions`, or the persona file in
the company pack):

```
Q: <the characteristic question>
   Coverage: yes | partially | no
   <if yes/partially:> Passage: "…relevant quoted passage…"
   <if no:> Missing: <what the content does not address>
```

Close with an overall verdict from the persona's point of view:

```
Verdict: Would [Persona] find this compelling? <yes/no + one-sentence reason>
What would stop them from taking the next step:
- <blocker 1>
- <blocker 2>
```

Maps to `section_1_review`:

- `header` → the "Reviewing as …" line
- `question_assessments` → list of `{question, coverage, passage, gap}`
- `would_find_compelling` → bool
- `blockers` → list of gap notes

## Persona resolution

- A persona named in the request ("run the CFO reviewer") is normalized
  (lowercase, spaces→underscores) and looked up in the loaded questions map.
- If not provided, the company pack's **primary ICP** is used.
- If the persona is not in the pack, fall back gracefully to the scaffold
  `default` question set. The returned dict sets `persona_found: false` and
  `fallback_used: true`.

---

## Section 2 — Revised version addressing [persona]'s concerns

A rewrite that directly addresses the gaps from Section 1. This is **not** a
global de-slop — it focuses on persona-resonance substance gaps (the questions
marked "no" or "partially"). Keep the voice close to the original while filling
the substance gaps.

Maps to `section_2_revised_version` (a string).
