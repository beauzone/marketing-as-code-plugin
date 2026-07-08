# Changelog — MaC Company Manager

## v1.2.0 — 2026-04-28

Classification awareness + add-classifications backfill (Cycle Prompt C).

**What changed:**

- **Phase 4 (Audiences)** — Step 4 added: classification metadata prompt for
  ICP/persona files phrased as internal or research-oriented. Detection is heuristic
  on user phrasing only (no content analysis). No prompt for routine ICP interviews.

- **Phase 5 (Research)** — All Phase 5 files are now eligible for `research_context`
  classification. Steps 1 and 2 each include a classification prompt before writing;
  the skill defaults to offering `research_context` for competitive intel and market
  landscape files without requiring triggering phrasing.

- **Classification heuristics section** added between Phase 5 and Phase 6. Documents
  the detection heuristic (phrasing signals), prompt template with Y/n/override flow,
  constraint that source specs are never offered classification, and `onboarding_trace`
  recording.

- **Phase 6 Step 4 enhanced to pack contract v1.1** — now validates
  `_source_meta.classification` values against the supported set from §3.6
  (`external_customer`, `research_context`, `internal_stakeholder`, `partner_channel`).
  Surfaces unsupported values explicitly. Also surfaces `applies_when`-scoped criteria
  in compiled instances so users understand why criteria are conditional.

- **`--add-classifications` backfill mode** added to Phase 6. Scans existing packs
  for unclassified artifacts in `audiences/` and `research/`, applies heuristics,
  prompts for each. Respects prior declinations recorded in `onboarding_trace`.

- **`add-classifications {company-id}` command** added to §2 Commands table and
  §6 Update Workflows. Documented as the migration path for packs created before v1.2.0.
  Includes `--force-reoffer` flag to re-prompt previously declined artifacts.

- **pack.yaml format updated** (§11): `onboarding_trace.classification_decisions`
  field added with schema documentation. Each entry records: artifact path,
  offered value, accepted (true/false/"overridden"), timestamp.

**Breaking changes:** None. Packs created before v1.2.0 continue to work unchanged.
The `onboarding_trace` field is additive.

## v1.1.0 — 2026-04-27

Phase 6 (Rubric Generation) added (Build Cycle 32).

**What changed:**

- Phase 6 inserted after Phase 5; existing Templates/Writer Profiles/Finalization
  shifted to Phases 7/8/9.
- Phase 6: compiler prerequisite check, compiler invocation per dimension,
  HITL review per instance (accept/request revision/skip), pack contract compliance
  check, scoring readiness announcement.
- `recompile rubrics {company-id}` backfill command.
- `## 9. Validation` table extended with 4 rubric instance entries.
- Phase 9 completeness report updated to include rubric instance row.

## v1.0.0 — 2026-04-25

Initial release.

**What's included:**

- **SKILL.md** — Full company onboarding skill (§0–§12)
  - Session startup: self-update check, MaC MCP detection, installed pack scan,
    legacy pack detection (kymata-document-creator, b2b-gtm-strategist,
    gtm-strategist paths)
  - 8-phase company creation flow: identity, brand, messaging, audiences,
    research, templates, writer profiles, finalization
  - Brand pack export with parent company_id reference
  - Collision handling: version comparison, no silent overwrite
  - Update workflows: re-run specific interview sections, version increment
  - Template conversion: PPTX → manifest.json + content-schema.json + copy-prompt.md
  - PDF brand guidelines extraction → visual-identity.yaml draft
  - Legacy migration: brand-pack.yaml field mapping to MaC schema structure
  - Validation: required files, schema compliance, cross-reference integrity
  - Sync/refresh/offline asset management

- **scripts/extract_pptx_template.py** — PPTX template extraction script
  - Reads all slides using python-pptx
  - Extracts text shapes, image placeholders, tables
  - Calculates max_chars from physical dimensions and font size
  - Generates manifest.json, content-schema.json, copy-prompt.md
  - Copies source PPTX alongside generated specs

- **scripts/extract_brand_from_pdf.py** — PDF brand guidelines extractor
  - Extracts hex colors, RGB values, Pantone references
  - Detects font families from common font name list
  - Extracts logo usage rules and clear space specifications
  - Generates draft visual-identity.yaml for review

- **references/schema-summary.md** — Quick reference for all MaC schema fields
  - Covers: company.yaml, voice.yaml, tone-guidelines.yaml, terminology.yaml,
    visual-identity.yaml, positioning-framework.yaml, messaging-pillars.yaml,
    value-propositions.yaml, proof-points.yaml, competitive-positioning.yaml,
    icp.yaml, persona.yaml, writer-profile.yaml, pack.yaml
