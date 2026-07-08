# PPTX Renderer Workflow

This document defines the **deterministic, step-by-step algorithm** for generating branded PPTX presentations. Follow these steps exactly.

## Prerequisites

```bash
pip install python-pptx Pillow cairosvg PyYAML
```

For thumbnail generation, LibreOffice must be installed (`soffice` on PATH).

---

## Step 1: Resolve Company and Brand Pack

**REQUIRED**: The user must specify a company (e.g., "kymata"). Do not generate branded PPTX without a `company_id`.

```
company_id = <user-specified or derived from context>
brand_pack_path = companies/<company_id>/brand-pack/brand-pack.yaml
```

Load the brand pack YAML. Key fields to use:

| Field | Purpose |
|-------|---------|
| `pptx.templates.master` | Path to CIO/general deck master template |
| `pptx.templates.datasheet` | Path to datasheet template |
| `logo.paths.dir` | Directory containing logo files |
| `logo.placement` | Where to position the logo (e.g., "bottom-right") |
| `colors.*` | Brand color palette (reference only; PPTX theme is authoritative) |
| `typography.*` | Brand fonts (reference only; PPTX theme is authoritative) |

**Precedence rule**: For PPTX outputs, the template's embedded theme (fonts, colors) is **authoritative**. The brand-pack.yaml selects which template and logo variants to use but does NOT override theme tokens unless the user explicitly requests it.

---

## Step 2: Select Template

Based on the user's request:

| Request Type | Template Field | Example |
|-------------|---------------|---------|
| Deck / presentation / pitch | `pptx.templates.master` | `companies/kymata/templates/pptx/kymata-cio-deck-master.pptx` |
| Datasheet / product sheet | `pptx.templates.datasheet` | `companies/kymata/templates/pptx/kymata-datasheet-template.pptx` |

---

## Step 3: Analyze Template

Generate a thumbnail grid to see all available slide layouts:

```bash
python renderers/pptx/scripts/thumbnail.py <template.pptx> template-preview
```

This creates `template-preview-grid-*.png` files showing all slides. Use these to identify:
- Which slide indices match which layout types (title, content, section divider, etc.)
- Where logos appear
- Where text placeholders are

---

## Step 4: Plan Slide Sequence

Create a slide plan mapping your content to template slide indices:

```
Slide Plan:
  Slide 1 (Cover):       template index 0
  Slide 2 (Agenda):      template index 1
  Slide 3 (Content):     template index 3
  Slide 4 (Content):     template index 3  (duplicate)
  Slide 5 (Closing):     template index 19
```

Build the comma-separated sequence: `0,1,3,3,19`

---

## Step 5: Rearrange Slides

Duplicate and reorder slides from the template:

```bash
python renderers/pptx/scripts/rearrange.py <template.pptx> <output.pptx> <sequence>
```

Example:
```bash
python renderers/pptx/scripts/rearrange.py \
  companies/kymata/templates/pptx/kymata-cio-deck-master.pptx \
  output-deck.pptx \
  0,1,3,3,19
```

This preserves all theme colors, fonts, layouts, and embedded logos from the template.

---

## Step 6: Extract Placeholder Text

Run inventory to see all text in the output deck:

```bash
python renderers/pptx/scripts/inventory.py output-deck.pptx > inventory.json
```

The inventory JSON shows every text element with its slide index, shape name, and current text content. Use this to identify which placeholders to replace.

---

## Step 7: Create Replacement Map

Build a replacement JSON file mapping old text to new text:

```json
{
  "replacements": [
    {
      "slide_index": 0,
      "shape_name": "Title 1",
      "old_text": "Presentation Title",
      "new_text": "Q1 2026 Business Review"
    },
    {
      "slide_index": 0,
      "shape_name": "Subtitle 2",
      "old_text": "Subtitle goes here",
      "new_text": "Prepared for Executive Team"
    }
  ]
}
```

Rules:
- Match `old_text` exactly as shown in inventory
- Preserve formatting by replacing text content only (fonts/colors come from template theme)
- Do NOT change font names or colors in the replacement — the template theme handles this

---

## Step 8: Apply Replacements

```bash
python renderers/pptx/scripts/replace.py output-deck.pptx replacements.json
```

This modifies `output-deck.pptx` in place, replacing text while preserving all formatting.

---

## Step 9: Logo Handling (if needed)

If the template already contains the logo in the correct position, **skip this step** — the logo is preserved by the rearrange step.

If you need to insert or replace a logo:

1. **Convert SVG to PNG** (PPTX does not reliably embed SVG):
   ```bash
   python renderers/pptx/scripts/convert_logo.py \
     companies/kymata/brand-pack/assets/logos/logo-primary.svg \
     /tmp/logo-primary.png \
     --width 300
   ```

2. **Insert via OOXML** (for advanced placement):
   ```bash
   python renderers/pptx/scripts/unpack.py output-deck.pptx output-deck-unpacked/
   # Edit XML to insert image reference
   python renderers/pptx/scripts/pack.py output-deck-unpacked/ output-deck.pptx
   ```

3. **Or use python-pptx** for simpler insertion:
   ```python
   from pptx import Presentation
   from pptx.util import Inches

   prs = Presentation("output-deck.pptx")
   slide = prs.slides[0]
   slide.shapes.add_picture("/tmp/logo-primary.png", Inches(8.5), Inches(6.8), width=Inches(1.2))
   prs.save("output-deck.pptx")
   ```

---

## Step 10: QA Validation

Generate final thumbnails and verify:

```bash
python renderers/pptx/scripts/thumbnail.py output-deck.pptx output-preview
```

**Checklist** (verify in thumbnail grid):
- [ ] Correct number of slides
- [ ] Logo present on expected slides
- [ ] Text content populated (no placeholder text remaining)
- [ ] Colors match brand (teals/navy for Kymata, not generic blue/gray)
- [ ] Fonts are consistent (Segoe UI for Kymata)
- [ ] No text overflow or cutoff
- [ ] Layout structure matches template patterns

If any check fails, fix the issue and re-run from the appropriate step.

---

## Quick Reference: Full Pipeline

```bash
# 1. Rearrange slides from template
python renderers/pptx/scripts/rearrange.py <template> <output> <sequence>

# 2. Extract text inventory
python renderers/pptx/scripts/inventory.py <output> > inventory.json

# 3. Build replacements.json from inventory + user content

# 4. Apply replacements
python renderers/pptx/scripts/replace.py <output> replacements.json

# 5. (Optional) Convert and insert logo
python renderers/pptx/scripts/convert_logo.py <logo.svg> <logo.png>

# 6. Generate QA thumbnails
python renderers/pptx/scripts/thumbnail.py <output> preview
```

---

## Editing Existing PPTX Files

For modifying existing presentations (not creating from template):

```bash
# Unpack to directory
python renderers/pptx/scripts/unpack.py existing.pptx unpacked/

# Edit XML files in unpacked/ppt/slides/
# (e.g., change text, update colors, adjust layout)

# Repack
python renderers/pptx/scripts/pack.py unpacked/ output.pptx
```

---

## Theme Extraction (for reconciliation)

To verify that brand-pack.yaml matches the template theme:

```bash
python renderers/pptx/scripts/extract_theme.py <template.pptx> --json
```

Compare the output colors/fonts against `brand-pack.yaml`. The template theme is authoritative for PPTX outputs.
