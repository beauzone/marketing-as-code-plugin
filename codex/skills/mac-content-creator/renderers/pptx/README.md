# PPTX Renderer

Template-based PowerPoint renderer that produces deterministically branded presentations using company master templates and brand packs.

## How It Works

1. **Template-first**: Every branded PPTX starts from a company's master template (`.pptx`), which embeds the correct theme fonts, colors, and layouts.
2. **Slide selection**: The `rearrange.py` script duplicates and reorders slides from the template to match the desired deck structure.
3. **Content injection**: The `inventory.py` + `replace.py` pipeline extracts placeholder text and replaces it with actual content, preserving all formatting.
4. **Logo handling**: SVG logos are converted to PNG (`convert_logo.py`) for reliable embedding. Template logos are preserved automatically.
5. **QA validation**: Thumbnail grids (`thumbnail.py`) provide visual verification that branding is intact.

## Key Principle

> The PPTX template theme is **authoritative** for fonts and colors.
> `brand-pack.yaml` selects which template and logo variants to use.
> Do NOT override theme tokens unless the user explicitly requests it.

This ensures deterministic, consistent output regardless of how the AI interprets brand guidelines.

## Scripts

| Script | Purpose | Dependencies |
|--------|---------|-------------|
| `scripts/rearrange.py` | Duplicate/reorder slides from a template | `python-pptx` |
| `scripts/inventory.py` | Extract all text from PPTX to JSON | `python-pptx` |
| `scripts/replace.py` | Replace text content from a JSON map | `python-pptx` |
| `scripts/thumbnail.py` | Generate thumbnail grids for QA | `Pillow`, LibreOffice |
| `scripts/unpack.py` | Unpack PPTX to directory (OOXML) | stdlib |
| `scripts/pack.py` | Repack directory to PPTX | stdlib |
| `scripts/extract_theme.py` | Extract theme colors/fonts from PPTX | stdlib |
| `scripts/convert_logo.py` | Convert SVG logos to PNG | `cairosvg` |

## Dependencies

```bash
pip install python-pptx Pillow cairosvg PyYAML
```

For thumbnail generation, LibreOffice must be installed:
- macOS: `brew install --cask libreoffice`
- Linux: `sudo apt install libreoffice`

## Workflow

See `workflow.md` for the complete step-by-step algorithm.

## Smoke Tests

### Test 1: CIO Deck (5 slides)
```bash
python scripts/rearrange.py \
  ../../companies/kymata/templates/pptx/kymata-cio-deck-master.pptx \
  /tmp/test-cio-deck.pptx \
  0,1,3,5,19

python scripts/inventory.py /tmp/test-cio-deck.pptx > /tmp/test-inventory.json
python scripts/thumbnail.py /tmp/test-cio-deck.pptx /tmp/test-cio-preview
```
**Verify**: Segoe UI fonts, teal/navy palette, Kymata logo present, layout matches master.

### Test 2: Datasheet
```bash
python scripts/rearrange.py \
  ../../companies/kymata/templates/pptx/kymata-datasheet-template.pptx \
  /tmp/test-datasheet.pptx \
  0,1

python scripts/thumbnail.py /tmp/test-datasheet.pptx /tmp/test-ds-preview
```
**Verify**: Correct template used, branding applied.

### Test 3: Theme Extraction
```bash
python scripts/extract_theme.py \
  ../../companies/kymata/templates/pptx/kymata-cio-deck-master.pptx --json
```
**Verify**: Colors and fonts match `brand-pack.yaml`.

### Test 4: Logo Conversion
```bash
python scripts/convert_logo.py \
  ../../companies/kymata/brand-pack/assets/logos/logo-primary.svg \
  /tmp/logo-primary.png --width 300
```
**Verify**: PNG output is valid and visually correct.
