---
name: mac-copy-reviewer
version: 1.0.1
description: >
  Review, audit, and rewrite marketing content against MaC writing quality standards.
  Three modes: detect (flag AI patterns without rewriting), rewrite (flag and fix with
  two-pass detection), expert-panel (adversarial review from target persona POV).
  Loads brand voice, personas, and vocabulary from the company pack or MaC MCP server.
  Use when: "review this draft", "audit this content", "de-slop", "clean up AI writing",
  "check for AI patterns", "expert panel review", "run [persona] reviewer",
  "score this content", "what's wrong with this copy", "make this less AI".
---

# mac-copy-reviewer

MaC's de-slop layer. It makes the BEA-61 writing-quality rubric system
interactively usable, adds two-pass detection, and introduces expert-panel mode
where a target persona from the company pack becomes an adversarial reviewer.

It scores four writing-quality dimensions (`wr-ai-pattern`,
`wr-factual-quality`, `wr-voice-fidelity`, `wr-persona-resonance`) that make up
the 25% writing-quality bundle.

In the MaC source repository these are implemented by
`skills/_shared/copy_reviewer.py` and `skills/_shared/standalone_scoring.py`.
Those files are **not** part of the installed plugin: when running as a plugin,
do the review yourself against the loaded context and the output templates in
`references/` — do not try to import or run them.

## Mode detection

Detect the mode from the trigger phrase in the user request. An explicit mode
(passed directly) always wins over phrase detection.

**Detect mode** triggers: "detect", "flag only", "audit only", "just flag",
"scan", "what's wrong", "check for".

- Flags AI patterns without rewriting.
- Useful for auditing content you do not want altered, quick scans, CI gates.

**Rewrite mode** triggers (default): "de-slop", "clean up", "rewrite", "fix",
"remove AI", "review and fix", "make this sound human".

- Flags patterns AND rewrites to fix them.
- Two-pass detection: pass 1 generates the rewrite, pass 2 re-reads the rewrite
  specifically for surviving patterns.

**Expert-panel mode** triggers: "expert panel", "run [persona name] reviewer",
"review as [persona]", "CIO review", "CFO review", "practitioner review".

- Loads the target persona from the company pack.
- Reviews content as that persona, asking their characteristic questions.
- Returns a persona-specific critique plus a targeted rewrite addressing those
  concerns.

Anything matching no trigger falls back to **rewrite** mode.

## Context loading

At the start of every review session, load from the company pack (via the MaC
MCP server if connected, else the local company pack path).

**Detecting the server:** look for a tool ending in `whoami` alongside MaC pack
tools such as `get_brand_voice` (any namespace prefix). When in doubt, call
`whoami`; an error means no usable server — say so.

**With the server:** `list_my_companies` (ask if more than one; never guess the
slug) → `get_brand_voice(company_slug)` (pass `brand` if it reports
`brand_ambiguous`) → `get_company_audiences(company_slug)` for the company's
personas → `get_company_pack_file(company_slug, "brands/{brand}/terminology.yaml")`
for vocabulary → `get_writer_profile(writer_profile_id)` if the user names one.
If a call errors, tell the user what failed rather than silently using defaults.

1. Brand voice guide — for voice_fidelity scoring.
2. Target persona — for persona_resonance scoring and expert-panel mode.
3. Writer profile — for voice calibration.
4. Company vocabulary: `preferred[]`, `banned[]`, `tier1_exceptions[]`. Where a
   term carries `scope: scoped` with `allowed_in` / `prohibited_in`, flag it only
   in the contexts it is prohibited in (by content type, or when the company or
   one of its capabilities is the sentence subject); report allowed uses as
   information, not violations.
5. Content type + funnel stage — for the tolerance matrix and copy-structure check.
6. Model assignments — for `model_router.py`.

If the company pack is not found: run with system defaults (balanced preset,
generic B2B patterns) and warn the user that company-specific context is not
loaded. `tier1_exceptions` lets a company sanction otherwise-flagged generic
vocabulary; a company `banned` term is treated as a Tier-1 violation for that
company.

In the MaC source repository, each loaded file is logged via
`logger.complete_stage(session, "context_loaded", ...)`; skip this in the
installed plugin.

## Detect mode output

Return exactly two sections. The canonical layout is
`references/detect-output-template.md`.

**Section 1 — Issues found.** Group flagged issues by severity (P0 first, then
P1, P2). For each: severity badge, category (ai_pattern/factual/voice/persona),
quoted text, pattern name + plain-English explanation, suggested fix.

**Section 2 — Assessment.** Clear problems (P0/P1), judgment calls (P2),
dimension scores (AI-pattern, Factual quality, Voice fidelity, Persona
resonance, Overall — each X/10), and the rewrite-threshold check: if 5+ tier-1
flags AND 3+ pattern categories AND uniform rhythm → "Full rewrite recommended.
The structure itself is AI-generated. State the core point in one sentence, then
rebuild."

## Rewrite mode output

Return exactly four sections. Canonical layout:
`references/rewrite-output-template.md`.

1. **Issues found** — same format as detect Section 1.
2. **Rewritten version** — clean copy. If the rewrite threshold triggered, a
   full rewrite from scratch; otherwise targeted patching. Make it specific,
   direct, and human — not AI-with-buzzwords-removed.
3. **What changed** — bulleted edits referencing specific pattern names.
4. **Second-pass audit** — re-read the rewrite, run detection again, report
   surviving violations (fix inline), post-rewrite dimension scores, and a
   pass/hold/revise verdict against the 70% publish threshold.

## Expert-panel mode output

Load the target persona from the company pack. If none is provided, use the
primary ICP. Canonical layout: `references/expert-panel-template.md`.

1. **[Persona name] review** — header "Reviewing as [Persona Name], [Title] at
   [Company Type]". For each characteristic question: state it, assess coverage
   (yes / partially / no), quote the passage if yes/partially, note what is
   missing if no. Overall verdict from the persona's POV.
2. **Revised version addressing [persona]'s concerns** — focuses on
   persona-resonance gaps, not a global de-slop; voice stays close to the
   original.

## Revision instructions (grader-loop contract)

When any mode scores below the 70% threshold, also emit the structured
`revision_instructions` block (see `references/revision-instruction-schema.md`).
This is what BEA-65 (grader loop) consumes to drive the revision pass. It is
included in the returned dict, not shown to the user.

## Programmatic usage (MaC source repository only)

```python
from skills._shared.copy_reviewer import review, load_context

result = review(draft_text, user_request="de-slop this", company_pack_path=pack_dir)
print(result["section_2_rewritten_version"])
```

`rewrite_fn` may be injected to use an LLM rewrite in production; the default is
a deterministic heuristic rewrite so the flow runs (and tests) without an LLM.
