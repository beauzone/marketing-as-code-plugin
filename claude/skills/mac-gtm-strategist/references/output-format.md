# Output Format & Structure — GTM Strategist

> Defines how the skill structures all analysis outputs and prepares them for handoff to document creation skills.
> Follow this format exactly for every analysis.

## Standard Output Structure

Every output follows this exact structure:

```markdown
---
🧠 FRAMEWORK: [Framework Name]
📅 DATE: [Date]
🏢 COMPANY: [Company name or "Not specified"]
📊 STAGE: [Company stage or "Not specified"]
🏷️ DOMAIN: [B2B / B2C / Hybrid]
---

## Executive Summary
[2-4 sentence BLUF. Lead with the core strategic conclusion, not a recap of what the framework is.]

## [Framework Section 1]
[Insights, backed by data or assumptions. End with a "so what" / implication.]

## [Framework Section 2]
[Insights, backed by data or assumptions. End with a "so what" / implication.]

[...continue through framework dimensions...]

---
📄 READY FOR: [Document skill name]
CONTENT TYPE: [Document type]
SECTIONS: [List the main sections]
SUGGESTED LENGTH: [Specific format recommendation]
KEY OUTPUTS: [3-5 most important findings]

To use: Copy this entire output and paste it into your [document skill] with the instruction: "Build this into a [document type]."
---
```

## Content Quality Standards

All outputs must meet these standards before delivery:

| Standard | Requirement |
|---|---|
| **Executive Summary leads** | Every output opens with a 2–4 sentence BLUF (Bottom Line Up Front) |
| **Evidence over assertion** | Claims are backed by data, examples, or explicit stated assumptions |
| **Actionability** | Every section ends with a "so what" — implication or next step |
| **Prioritization** | Lists are ranked by business impact, not completeness |
| **Length discipline** | Board-ready memos ≤ 5 pages; slide outlines ≤ 12 slides |
| **Stakeholder safety** | All language is constructive and forward-looking (see stakeholder-rules.md) |

## Document Type → Skill Mapping

Choose the appropriate document skill handoff based on the deliverable type:

| Deliverable Type | Handoff Skill | Format |
|---|---|---|
| Strategy memo, positioning doc, narrative | Word skill | Long-form document |
| Executive presentation, board deck, investor slides | PowerPoint skill | Slide deck |
| Competitive matrix, feature comparison, scoring | Excel skill | Structured table / scorecard |
| OKR scorecard, funnel metrics, attribution model | Excel skill | Dashboard / tracker |
| Campaign brief, messaging guide | Word skill | Briefing document |
| Launch plan, roadmap | PowerPoint skill | Phased presentation |
| Messaging & positioning workbook | Excel skill | Multi-sheet workbook (6 sheets) |

## Spreadsheet Output Format — Multi-Sheet Workbooks

When the output targets a multi-sheet Excel workbook (e.g., `messaging-positioning-workbook` template),
use sheet delimiters to separate content by sheet:

```
===== SHEET 1: [Sheet Name] =====
[Content for this sheet — tables, matrices, or structured data]

===== SHEET 2: [Sheet Name] =====
[Content for this sheet]
```

**Formula placeholders:** Use `=FORMULA_NAME(...)` syntax in cells where Excel formulas
are required. The XLSX skill will translate these into working Excel formulas.

**Handoff block for workbooks:**

```
📄 READY FOR: Spreadsheets (xlsx)
CONTENT TYPE: [Workbook type, e.g., Messaging & Positioning Workbook]
SHEETS: [Comma-separated list of sheet names to populate]
FORMULAS REQUIRED: Yes/No
CONDITIONAL FORMATTING: [Description if applicable]
```
