# Artifact Creation Guide — GTM Strategist

This guide explains how to create, customize, and store artifacts (personas, frameworks, templates, brand packs) in the GTM Strategist skill.

---

## Brand Pack Creation

Brand packs are company-specific context bundles stored locally. When you create a brand pack, the skill:
1. Asks for the company name and website URL
2. Asks you to provide brand documents, positioning decks, or messaging guides
3. Stores everything in `~/.claude/skills/gtm-strategist/companies/{company_id}/`

### Pack structure
```
companies/{company_id}/
├── pack.yaml         — name, url, created_at, business_model, stage, notes
├── sources/          — ingested brand, messaging, research files
├── personas/         — custom personas created for this company
├── frameworks/       — company-specific framework customizations
└── templates/        — company-specific template customizations
```

### business_model field in pack.yaml
Captures: `B2B SaaS` / `Enterprise B2B` / `B2C DTC` / `Consumer App` / `Subscription` / `Marketplace` / `Retail` / `Hybrid`

This value determines which persona families and stage model the skill uses by default for this company.

---

## Brand Pack Migration from b2b-gtm-strategist

If you previously used the B2B GTM Strategist skill, your brand packs are at:
`~/.claude/skills/b2b-gtm-strategist/companies/`

To migrate all packs to the new unified skill:
```bash
cp -r ~/.claude/skills/b2b-gtm-strategist/companies/ ~/.claude/skills/gtm-strategist/companies/
```

The unified skill detects existing packs at the old path and offers this migration during session startup (Step 2).

---

## Custom Persona Creation

When no existing persona matches, the skill creates one.

### For B2B buyer personas
Schema: `schemas/persona.schema.yaml` from mac-registry. Collect:
- Role title and seniority
- Industry/domain
- Key priorities and KPIs
- Known vocabulary and jargon
- Buying committee position and influence type
- Typical objections and proof point preferences

### For B2C consumer archetypes
Same schema, consumer-specific fields:
- Archetype name (behavioral descriptor, e.g., "Health-Conscious Millennial Parent")
- Media consumption habits and platform preferences
- Purchase trigger signals and barriers
- Trust signal hierarchy (reviews, influencers, brand heritage, etc.)
- Price sensitivity level and willingness-to-pay signals

### For B2C operator personas
Same schema as B2B buyer, but oriented toward marketing practitioners:
- Role title and function owned
- KPIs they're held to
- Tools and platforms they use daily
- How they evaluate strategy or vendor proposals

### Storage
New personas saved to:
- `companies/{company_id}/personas/` — company-specific persona
- `user/personas/` — for personas used across multiple clients/companies

---

## Remote vs Local Assets

| Tier | Location | What's there |
|---|---|---|
| System (remote) | mac-registry (beauzone/mac-registry) | 82+ frameworks, 73+ personas, 23+ templates, writer profiles, rubrics |
| Approved (local) | `~/.claude/skills/gtm-strategist/companies/` or `user/` | Your customized or company-specific artifacts |

**Resolution precedence:** Company-specific artifacts override system defaults.

---

## Sync Commands

- **`sync`** — Downloads all system assets to local cache. Run on first install or full refresh.
- **`refresh`** — Incremental update — only downloads new or changed assets.

After sync, all assets are available offline in `~/.claude/skills/gtm-strategist/.cache/`.
