---
name: mac-copy-reviewer
version: 1.1.0
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

## The rulebook

The four rubrics ship with this skill in `references/rubrics/`, with a detection
guide beside them at `references/pattern-guide.md`. Read them at the
start of every review; they are the source of every pattern name, list, threshold
and score anchor this skill uses. Do not invent pattern names that are not in them.

| File | Use it for |
|---|---|
| `wr-ai-pattern.yaml` | `vocabulary` tiers 1–3 (tier 1 always flags; tier 2 in clusters of 2+ per paragraph; tier 3 above `tier_3_density_threshold`), `pattern_categories` (the pattern names to cite), `severity` (which patterns are P0/P1/P2), `context_profiles` (tolerance by content type: multiply flagging thresholds; lower is stricter), `rewrite_trigger`, `scoring_rubric` |
| `wr-factual-quality.yaml` | Sub-dimensions, citation density, freshness horizons, the evidence each claim type needs, `scoring_rubric` |
| `wr-voice-fidelity.yaml` | Voice sub-dimensions, hedge markers, `scoring_rubric` |
| `wr-persona-resonance.yaml` | Funnel-stage copy structures (TOFU/MOFU/BOFU), `persona_reviewer_questions`, `scoring_rubric` |
| `references/pattern-guide.md` (one folder up from the rubrics, not inside `rubrics/`) | How to detect each of the 42 `pattern_categories`, and its severity — the rubric defines detection only for vocabulary and severity for only 10 categories |

**Company rules override the rubric.** The company's own pack (loaded below) wins
wherever the two disagree: a company prohibited term is a tier-1 violation even
if the rubric doesn't list it; a company approved or preferred term, or a term the
company scopes as allowed in this context, is never flagged even if the rubric
lists it.

**Scoring.** Score each dimension 0–10 by choosing the anchor in that rubric's
`scoring_rubric` whose description best fits, interpolating between anchors when
the text falls between them. Name the anchor you used. Overall writing quality is
the mean of the four (each weighted 0.25). The publish threshold is 70%: overall
7.0/10 or higher, with no P0 findings.

**Hard floor.** `wr-factual-quality.yaml` marks `factual_accuracy` as a hard
floor: a load-bearing claim you can show is false (it contradicts an approved
proof point, the cited source, or plain fact) is P0, sets factual quality to 0,
and sets overall writing quality to 0. The draft cannot pass, whatever the other
scores. A claim you merely cannot verify is not "false"; handle it as below.

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

**With the server:**
1. `list_my_companies` — ask if more than one; never guess the slug.
2. `get_brand_voice(company_slug)` — pass `brand` if it reports `brand_ambiguous`.
   Besides tone and terms, read the voice file's `anti_patterns` (named
   constructions the company bans; check every one of them, as P1 by default) and
   `standing_exceptions` (approved lines that must never be flagged or rewritten,
   even when they match an anti-pattern or a rubric pattern).
3. `get_company_pack_file(company_slug, "brands/{brand}/terminology.yaml")` —
   approved and prohibited terms, including scoped entries.
4. `get_messaging_framework(company_slug, brand)` — the approved proof points and
   their sources, needed for factual quality (see below).
5. `get_company_audiences(company_slug)` — the company's ICPs and personas.
6. A writer profile, only if the user names one: look for
   `brands/{brand}/writer-profiles/{id}.yaml`, then `writer-profiles/{id}.yaml` at
   the pack root, in `list_company_pack_files`, and read it with
   `get_company_pack_file`; if the company has none by that name, use
   `get_writer_profile(id)` for the system library (`list_writer_profiles`).

If a call errors, tell the user what failed rather than silently using defaults.

**Without the server, from a local company pack** (`~/.claude/mac/companies/{id}/`,
or the legacy paths in the other MaC skills): read the same context from files —
`brands/{brand}/voice.yaml`, `brands/{brand}/terminology.yaml`,
`brands/{brand}/messaging/*.yaml` (including `proof-points.yaml`),
`audiences/icps/` and `audiences/personas/`, and a named writer profile from
`brands/{brand}/writer-profiles/` or `writer-profiles/`.

1. Brand voice guide — for voice_fidelity scoring.
2. Target persona — for persona_resonance scoring and expert-panel mode.
3. Writer profile — for voice calibration.
4. Company vocabulary. Field names vary by pack, and entries may be plain strings
   or objects carrying a `term`:
   - **Banned:** `banned[]`; `prohibited_terms` as a flat list; the
     `prohibited_terms.hard_no[]` group of the standard pack schema; and any other
     group under `prohibited_terms` (e.g. `empty_buzzwords`, `weak_verbs`) unless
     it is marked scoped (below). Flag as tier-1 violations.
   - **Warn:** `prohibited_terms.soft_warn[]` — flag as P2.
   - **Exceptions (never flag):** `tier1_exceptions[]`, top-level
     `preferred_terms[]`, and any `approved_terms` groups, in terminology.yaml or
     the voice file.
   Where a
   term carries `scope: scoped` with `allowed_in` / `prohibited_in`, flag it only
   in the contexts it is prohibited in (by content type, or when the company or
   one of its capabilities is the sentence subject); report allowed uses as
   information, not violations.
5. Content type + funnel stage — ask if not obvious. Content type selects the
   `context_profiles` tolerance in `wr-ai-pattern.yaml`; funnel stage selects the
   expected copy structure in `wr-persona-resonance.yaml`.

If the company pack is not found: run on the rubric defaults alone and warn the
user that company-specific voice, terms, proof points and personas are not
loaded, so voice, factual and persona scores are generic. `tier1_exceptions` lets a company sanction otherwise-flagged generic
vocabulary; a company `banned` term is treated as a Tier-1 violation for that
company.

In the MaC source repository, each loaded file is logged via
`logger.complete_stage(session, "context_loaded", ...)`; skip this in the
installed plugin.

## Factual quality — check claims against the pack

For every statistic, percentage, named study, analyst citation, customer result
or comparative claim in the draft, look for it in the proof points returned by
`get_messaging_framework`:

- **Matches an approved proof point** — check that the number, wording and
  attribution match the pack exactly (including any required attribution line).
  A changed number or a dropped/changed source is P0.
- **Not in the pack** — flag it P1 as "not an approved proof point; verify the
  source before publishing". Never invent or guess a source for it.
- Apply `claim_type_evidence_requirements` and `freshness_horizons` from
  `wr-factual-quality.yaml`.

If no proof points were loaded — from the server or a local pack — say that
claims could not be checked against approved sources and cap factual quality at
5/10. The cap depends only on whether proof points were loaded, not on whether the
server is connected.

## Persona questions (expert panel and persona resonance)

Build the reviewer's questions from two sources and say which each came from:
1. `persona_reviewer_questions` in `wr-persona-resonance.yaml`, matched to the
   persona's role (`cio`, `cfo`, `practitioner`, `vp_marketing`; `default` when
   none fits).
2. The company's persona file from `get_company_audiences`: turn its pains
   (`pains` or `pain_points`), objections (`common_objections` or `objections`),
   `success_metrics` and `buying_triggers` — whichever are present — into 3–5
   questions that persona would ask of this draft.

Company-derived questions take priority when the two overlap.

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

## Revision instructions (MaC source repository only)

In the MaC source repository, a review below the 70% threshold also returns a
machine-readable `revision_instructions` block for the BEA-65 grader loop (see
`references/revision-instruction-schema.md`). In the installed plugin there is no
program to consume it: **do not emit it or show it to the user.** When a review
falls below the threshold, the rewrite and "What changed" sections already tell
the user what to fix.

## Programmatic usage (MaC source repository only)

```python
from skills._shared.copy_reviewer import review, load_context

result = review(draft_text, user_request="de-slop this", company_pack_path=pack_dir)
print(result["section_2_rewritten_version"])
```

`rewrite_fn` may be injected to use an LLM rewrite in production; the default is
a deterministic heuristic rewrite so the flow runs (and tests) without an LLM.
