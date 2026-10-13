# Expert-panel mode — output template

> The "maps to …" notes below describe the source-repository engine's return
> value. In the installed plugin, render the sections directly.

Expert-panel mode reviews content as a target persona, then produces a targeted
rewrite that closes the gaps that persona cares about. Render exactly two
sections.

---

## Section 1 — [Persona name] review

Header line:

```
Reviewing as [Persona Name], [Title] at [Company Type]
```

Ask the combined question set described in SKILL.md "Persona questions": the
rubric's role questions (`references/rubrics/wr-persona-resonance.yaml`
`persona_reviewer_questions`) **and** 3–5 questions derived from the company's
persona file, company-derived ones first where they overlap. Tag each question
with its source:

```
Q [company persona | rubric]: <the characteristic question>
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

- A persona named in the request ("run the CFO reviewer") is matched to the
  company's persona files first, then to a rubric role key (`cio`, `cfo`,
  `practitioner`, `vp_marketing`).
- If not provided, the company pack's **primary ICP** is used.
- If the persona isn't in the company pack, use the rubric's role questions alone
  (the `default` set when no role fits) and say that no company persona was found.

---

## Section 2 — Revised version addressing [persona]'s concerns

A rewrite that directly addresses the gaps from Section 1. This is **not** a
global de-slop — it focuses on persona-resonance substance gaps (the questions
marked "no" or "partially"). Keep the voice close to the original while filling
the substance gaps.

Maps to `section_2_revised_version` (a string).
