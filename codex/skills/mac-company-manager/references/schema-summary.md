# MaC Schema Quick Reference — Company Manager

Quick reference of all schema fields used by the Company Manager, organized
by file type. Use this during the interview flow to know what to collect.

Source schemas: `beauzone/mac-registry/schemas/` and `marketing-as-code/schemas/`

---

## company.yaml (`schemas/company.schema.yaml`)

**Authority level:** `tier_4_audience` | **Org scope:** `global`

### Required
| Field | Type | Notes |
|---|---|---|
| `metadata.id` | string (kebab-case) | e.g. `acme-company` |
| `metadata.version` | semver string | e.g. `"1.0.0"` |
| `metadata.display_name` | string | Company display name |
| `metadata.schema_version` | string | `"1.0"` |
| `metadata.authority_level` | enum | `tier_4_audience` |
| `metadata.org_scope` | enum | `global` |
| `identity.legal_name` | string | Full legal entity name |
| `identity.category` | string | e.g. "B2B SaaS data platform" |
| `identity.elevator_pitch` | string | 30-second verbal pitch |
| `key_facts.ownership_structure` | string | VC-backed, bootstrapped, public, etc. |
| `key_facts.headquarters` | string | City, State/Country |
| `key_facts.domains` | list[string] | Web domains |
| `history.year_founded` | number | 4-digit year |
| `products.catalog` | list[object] | At least one product |
| `products.catalog[].id` | string (kebab-case) | Product identifier |
| `products.catalog[].name` | string | Product display name |
| `products.catalog[].category` | string | Product type |
| `products.catalog[].description` | string | For AI context |
| `products.catalog[].status` | enum | `active`, `beta`, `sunset` |

### Optional (collect if available)
| Field | Notes |
|---|---|
| `identity.mission` | Mission statement |
| `target_markets.segments` | Market segments |
| `target_markets.geographies` | Geographic markets |
| `competitive_landscape.direct_competitors` | Primary competitors |
| `distribution.channels` | How products are sold |
| `distribution.motion` | GTM motion |
| `messaging.positioning_statement` | Single positioning sentence |
| `messaging.value_proposition` | Primary value prop |
| `buying_dynamics.typical_buyer` | Primary buyer role |
| `buying_dynamics.buying_committee` | Roles in purchase decision |
| `buying_dynamics.avg_sales_cycle` | Typical sales cycle |
| `buying_dynamics.avg_deal_size` | Typical deal size |
| `assets.website` | Primary website URL |

---

## voice.yaml (`schemas/brand-voice.schema.yaml`)

**Authority level:** `tier_1_brand` | **Org scope:** `global`

### Required
| Field | Type | Notes |
|---|---|---|
| `metadata.id` | string | e.g. `acme-voice` |
| `metadata.version` | semver | `"1.0.0"` |
| `metadata.display_name` | string | e.g. "Acme Voice" |
| `metadata.schema_version` | string | `"1.0"` |
| `metadata.authority_level` | enum | `tier_1_brand` |
| `metadata.org_scope` | enum | `global` |
| `voice.characteristics` | list[string] | Brand personality adjectives |
| `voice.tone_guidance` | string | How to write in this brand's voice |

### Optional (collect during brand interview)
| Field | Notes |
|---|---|
| `voice.preferred_terms` | Terms to use |
| `voice.prohibited_terms` | Terms to avoid |
| `voice.writing_principles` | do/don't pairs |
| `voice.examples` | Before/after rewrite examples |

---

## tone-guidelines.yaml (uses brand-voice schema)

Store in: `brands/{brand-id}/tone-guidelines.yaml`

### Key fields to collect
| Field | Notes |
|---|---|
| `tone_guidelines.by_channel` | email, social, web, sales — tone per channel |
| `tone_guidelines.by_audience` | enterprise, SMB, consumer — tone per audience |
| `tone_guidelines.emotional_range` | What emotional register is acceptable |

---

## terminology.yaml (uses brand-voice schema)

Store in: `brands/{brand-id}/terminology.yaml`

### Key fields to collect
| Field | Notes |
|---|---|
| `terminology.approved_terms` | list of `{term, definition}` |
| `terminology.deprecated_terms` | list of `{term, preferred_replacement}` |
| `terminology.capitalization` | list of capitalization rules |

---

## visual-identity.yaml (`schemas/visual-identity.schema.yaml`)

Store in: `brands/{brand-id}/visual-identity.yaml`

### Colors (all optional but important for Content Creator)
| Field | Type | Notes |
|---|---|---|
| `colors.primary` | hex string | Main brand color |
| `colors.secondary` | hex string | Secondary color |
| `colors.accent` | hex string | Accent/highlight color |
| `colors.background_dark` | hex string | Dark background |
| `colors.background_light` | hex string | Light background |
| `colors.text_dark` | hex string | Dark text color |
| `colors.text_light` | hex string | Light text (on dark bg) |

### Typography
| Field | Notes |
|---|---|
| `typography.heading_font` | Font family for headings |
| `typography.body_font` | Font family for body text |
| `typography.mono_font` | Font for code/monospace |

### Logos
| Field | Notes |
|---|---|
| `logos.primary` | Path or URL to primary logo |
| `logos.icon` | Path or URL to icon/favicon |
| `logos.wordmark` | Path or URL to wordmark |

### Usage rules
| Field | Notes |
|---|---|
| `usage_rules.minimum_clear_space` | Min whitespace around logo |
| `usage_rules.prohibited_modifications` | list[string] |

---

## positioning-framework.yaml (`schemas/messaging-framework.schema.yaml`)

**Authority level:** `tier_2_positioning` | **Org scope:** `global`

| Field | Notes |
|---|---|
| `positioning.statement` | Geoffrey Moore-style positioning sentence |
| `positioning.category` | Market category |
| `positioning.target_audience` | Primary audience |
| `positioning.key_differentiator` | Primary differentiation claim |
| `positioning.proof` | list[string] — evidence |

---

## messaging-pillars.yaml

**Authority level:** `tier_2_positioning`

| Field | Notes |
|---|---|
| `messaging_pillars.pillars` | list of pillar objects |
| `pillars[].id` | Pillar identifier |
| `pillars[].name` | Pillar name |
| `pillars[].claim` | The specific claim |
| `pillars[].proof_points` | list[string] — evidence |

---

## value-propositions.yaml

**Authority level:** `tier_3_functional`

| Field | Notes |
|---|---|
| `value_propositions.primary` | Main value prop string |
| `value_propositions.by_persona` | object keyed by persona id |
| `value_propositions.by_use_case` | object keyed by use case |

---

## proof-points.yaml

**Authority level:** `tier_3_functional`

| Field | Notes |
|---|---|
| `proof_points.claims` | list of `{claim, metric, source, verified}` |
| `proof_points.case_study_refs` | list[string] paths |

---

## competitive-positioning.yaml

**Authority level:** `tier_2_positioning`

| Field | Notes |
|---|---|
| `competitive_positioning.vs` | list of `{competitor, differentiators, win_themes}` |
| `competitive_positioning.moat` | Sustainable competitive advantage |
| `competitive_positioning.win_themes` | list[string] — why we win |

---

## icp.yaml (`schemas/icp.schema.yaml`)

**Authority level:** `tier_4_audience` | **Org scope:** `global`

### Required
| Field | Notes |
|---|---|
| `metadata.id` | e.g. `enterprise-saas-icp` |
| `metadata.version` | `"1.0.0"` |
| `metadata.display_name` | ICP display name |
| `metadata.description` | Brief description |
| `metadata.schema_version` | `"1.0"` |
| `metadata.authority_level` | `tier_4_audience` |
| `metadata.org_scope` | `global` |
| `profile.company_attributes` | Firmographic criteria |
| `profile.behavioral_signals` | Buying signals |

### Key optional fields to collect
| Field | Notes |
|---|---|
| `company_attributes.industries` | Target industries |
| `company_attributes.employee_range` | min/max employee bands |
| `company_attributes.revenue_range` | min/max ARR bands |
| `company_attributes.geographies` | Geographic focus |
| `company_attributes.funding_stages` | Relevant stages |
| `buying_committee.primary_buyer` | Persona id of economic buyer |
| `buying_committee.champion` | Persona id of champion |
| `qualification.must_have` | Hard qualification criteria |
| `qualification.disqualifiers` | Auto-disqualification signals |

---

## persona.yaml (`schemas/persona.schema.yaml`)

**Authority level:** `tier_4_audience`

### Required
| Field | Notes |
|---|---|
| `metadata.id` | e.g. `vp-engineering` |
| `metadata.version` | `"1.0.0"` |
| `metadata.display_name` | Persona display name |
| `metadata.description` | Role summary |
| `metadata.schema_version` | `"1.0"` |
| `metadata.authority_level` | `tier_4_audience` |
| `metadata.org_scope` | `global` |
| `identity.persona_summary` | Detailed role narrative |
| `_source_meta.source` | `user_interview` or `web_research` |

### Key optional sections
| Section | Notes |
|---|---|
| `knowledge` | Domain expertise, pain points, vocabulary |
| `calibration` | AI behavioral calibration guidance |
| `stakeholder_guidance` | How to engage this persona |

---

## writer-profile.yaml (`schemas/writer-profile.schema.yaml`)

**Profile types:** `individual` (company/user scope only), `archetype`, `use_case`

### Required
| Field | Notes |
|---|---|
| `metadata.id` | e.g. `jane-smith-ceo` |
| `metadata.profile_type` | `individual` |
| `metadata.scope` | `company` (individual profiles are never system) |
| `identity.profile_purpose` | Why this profile exists |
| `voice.persona` | One-paragraph persona statement |
| `voice.register` | `formal`, `professional`, `conversational`, `casual` |
| `voice.stance` | `authoritative`, `collaborative`, `provocative`, `reflective`, `instructional` |
| `syntax.sentence_length` | Short / mixed / long tendency |
| `syntax.punctuation_habits` | Punctuation style description |
| `anti_patterns.prohibited_words` | list[string] |
| `anti_patterns.stylistic_aversions` | list[string] |

### Key optional
| Field | Notes |
|---|---|
| `identity.full_name` | Writer's full name |
| `identity.title` | Job title |
| `diction.complexity` | `simple`, `moderate`, `sophisticated`, `variable` |
| `diction.signature_phrases` | Verbatim phrases from samples |
| `sample_provenance.samples_analyzed` | Number of samples used |
| `sample_provenance.extraction_method` | `ai-claude`, `manual`, `stub` |

---

## pack.yaml (Company Manager metadata)

Not a MaC schema — this is Company Manager's own manifest.

### Required fields
| Field | Notes |
|---|---|
| `id` | company-id (kebab-case) |
| `version` | semver string |
| `schema_version` | `"1.0"` |
| `created_at` | ISO 8601 datetime |
| `updated_at` | ISO 8601 datetime |
| `created_by` | Email or "MaC Company Manager v1.0.0" |
| `company.name` | Display name |
| `company.legal_name` | Legal entity name |
| `brands` | list of `{id, display_name, is_primary}` |
| `assets.*` | counts: company, brands, icps, personas, segments, templates, writer_profiles, competitive_intel |
