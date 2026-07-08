#!/usr/bin/env python3
"""
extract_brand_from_pdf.py — MaC Company Manager
Extracts brand elements from a PDF brand guidelines document and generates
a draft visual-identity.yaml for review.

Usage:
  python extract_brand_from_pdf.py <path-to.pdf> [--brand-id ID] [--output DIR]

Requires: pypdf (or PyPDF2), optionally pdfplumber for better text extraction
  pip install pypdf pdfplumber

Output:
  visual-identity.yaml  (draft — review before committing to company pack)
"""

import argparse
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Dependency detection
# ---------------------------------------------------------------------------

def detect_pdf_library():
    """Return (module_name, reader_fn) for whichever PDF library is available."""
    try:
        import pdfplumber  # noqa: F401
        return "pdfplumber"
    except ImportError:
        pass
    try:
        from pypdf import PdfReader  # noqa: F401
        return "pypdf"
    except ImportError:
        pass
    try:
        from PyPDF2 import PdfReader  # noqa: F401
        return "PyPDF2"
    except ImportError:
        pass
    return None


def check_dependency():
    lib = detect_pdf_library()
    if lib is None:
        print("Error: a PDF reading library is required.")
        print("Install one with: pip install pypdf pdfplumber")
        sys.exit(1)
    return lib


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def extract_text_pdfplumber(pdf_path):
    import pdfplumber
    pages = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            pages.append(text)
    return "\n".join(pages)


def extract_text_pypdf(pdf_path, module_name):
    if module_name == "pypdf":
        from pypdf import PdfReader
    else:
        from PyPDF2 import PdfReader
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)
    return "\n".join(pages)


def extract_text(pdf_path, lib):
    if lib == "pdfplumber":
        return extract_text_pdfplumber(pdf_path)
    return extract_text_pypdf(pdf_path, lib)


# ---------------------------------------------------------------------------
# Color extraction
# ---------------------------------------------------------------------------

HEX_PATTERN = re.compile(r"#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b")
RGB_PATTERN = re.compile(r"RGB[:\s]*\(?(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})\)?", re.IGNORECASE)
CMYK_NOTE_PATTERN = re.compile(
    r"CMYK[:\s]*\(?(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})\)?", re.IGNORECASE
)
PANTONE_PATTERN = re.compile(r"Pantone\s+(\d{2,4}(?:\s+\w+)?)", re.IGNORECASE)


def rgb_to_hex(r, g, b):
    return f"#{int(r):02X}{int(g):02X}{int(b):02X}"


def normalize_hex(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return f"#{h.upper()}"


def is_likely_brand_color(hex_val):
    """Filter out near-white and near-black that are probably body text."""
    h = hex_val.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    brightness = (r * 299 + g * 587 + b * 114) / 1000
    # Skip near-white (>240) and near-black (<20) but keep intentional dark/light brand colors
    if brightness > 245 or brightness < 10:
        return False
    return True


def extract_colors(text):
    """Extract hex, RGB, and Pantone color mentions from text."""
    colors = []
    seen = set()

    # Hex colors
    for match in HEX_PATTERN.finditer(text):
        hex_val = normalize_hex(match.group(0))
        if hex_val not in seen and is_likely_brand_color(hex_val):
            colors.append({"value": hex_val, "source": "hex"})
            seen.add(hex_val)

    # RGB colors
    for match in RGB_PATTERN.finditer(text):
        r, g, b = match.group(1), match.group(2), match.group(3)
        hex_val = rgb_to_hex(r, g, b)
        if hex_val not in seen and is_likely_brand_color(hex_val):
            colors.append({"value": hex_val, "source": "rgb", "rgb": f"rgb({r},{g},{b})"})
            seen.add(hex_val)

    # Pantone mentions (for documentation — no hex conversion)
    for match in PANTONE_PATTERN.finditer(text):
        pantone = match.group(1).strip()
        colors.append({"value": None, "source": "pantone", "pantone": f"Pantone {pantone}"})

    return colors


# ---------------------------------------------------------------------------
# Typography extraction
# ---------------------------------------------------------------------------

FONT_SECTION_KEYWORDS = [
    "heading", "headline", "display", "title", "h1", "h2",
    "body", "copy", "paragraph", "text", "sans", "serif", "mono",
]

COMMON_FONTS = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway",
    "Poppins", "Source Sans", "Nunito", "Work Sans", "DM Sans",
    "Helvetica", "Arial", "Georgia", "Times New Roman", "Garamond",
    "Playfair Display", "Merriweather", "Ubuntu", "Noto Sans",
    "Segoe UI", "SF Pro", "Futura", "Gill Sans", "Gotham",
    "Proxima Nova", "Aktiv Grotesk", "Circular", "Graphik",
]


def extract_fonts(text):
    """Extract font family names from PDF text."""
    found = {}
    text_lower = text.lower()

    for font in COMMON_FONTS:
        if font.lower() in text_lower:
            # Find context around font mention
            idx = text_lower.find(font.lower())
            context = text[max(0, idx - 100): idx + 100].lower()

            role = "unknown"
            if any(k in context for k in ("heading", "headline", "display", "title", "h1")):
                role = "heading"
            elif any(k in context for k in ("body", "copy", "paragraph", "text", "body copy")):
                role = "body"
            elif any(k in context for k in ("mono", "code", "monospace")):
                role = "mono"

            if role not in found:
                found[role] = font
            elif role == "unknown" and "heading" not in found and "body" not in found:
                found[role] = font

    return found


# ---------------------------------------------------------------------------
# Logo and usage rule extraction
# ---------------------------------------------------------------------------

def extract_logo_rules(text):
    """Look for logo usage rules and clear space mentions."""
    rules = {}
    text_lower = text.lower()

    clear_space_match = re.search(
        r"clear\s*space[:\s]*([^\n.]{5,60})", text, re.IGNORECASE
    )
    if clear_space_match:
        rules["minimum_clear_space"] = clear_space_match.group(1).strip()

    prohibited = []
    prohibited_patterns = [
        r"do\s+not\s+([^\n.]{5,80})",
        r"never\s+([^\n.]{5,80})",
        r"don'?t\s+([^\n.]{5,80})",
    ]
    for pattern in prohibited_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            candidate = match.group(1).strip()
            if any(k in candidate.lower() for k in ("logo", "color", "font", "typeface", "brand")):
                if candidate not in prohibited:
                    prohibited.append(candidate[:120])

    if prohibited:
        rules["prohibited_modifications"] = prohibited[:6]  # cap at 6 rules

    return rules


# ---------------------------------------------------------------------------
# Section-aware color classification
# ---------------------------------------------------------------------------

COLOR_ROLE_KEYWORDS = {
    "primary": ["primary", "main", "brand color", "principal"],
    "secondary": ["secondary", "supporting", "complement"],
    "accent": ["accent", "highlight", "call to action", "cta"],
    "background_dark": ["dark background", "dark mode", "navy", "dark base"],
    "background_light": ["light background", "white", "off-white", "light base"],
    "text_dark": ["dark text", "body text", "copy color"],
    "text_light": ["reversed", "white text", "light text"],
}


def classify_colors(colors, text):
    """Attempt to assign semantic roles to extracted colors based on text context."""
    result = {}
    text_lower = text.lower()

    for color in colors:
        if color["value"] is None:
            continue
        hex_val = color["value"]
        # Search for context near this color's hex value
        idx = text_lower.find(hex_val.lower())
        if idx < 0:
            continue
        context = text_lower[max(0, idx - 200): idx + 200]
        for role, keywords in COLOR_ROLE_KEYWORDS.items():
            if any(kw in context for kw in keywords):
                if role not in result:
                    result[role] = hex_val
                break

    # If primary still not assigned, take first brand color
    if "primary" not in result and colors:
        for c in colors:
            if c["value"]:
                result["primary"] = c["value"]
                break

    return result


# ---------------------------------------------------------------------------
# YAML generation
# ---------------------------------------------------------------------------

def build_visual_identity_yaml(brand_id, classified_colors, all_colors, fonts, logo_rules):
    today = __import__("datetime").date.today().isoformat()

    lines = [
        f"# visual-identity.yaml — {brand_id}",
        "# Draft extracted from PDF brand guidelines.",
        "# Review all values before committing to your company pack.",
        "",
        "metadata:",
        f"  id: {brand_id}-visual-identity",
        '  version: "1.0.0"',
        '  schema_version: "1.0"',
        f'  display_name: "{brand_id.replace("-", " ").title()} Visual Identity"',
        "",
        "_source_meta:",
        "  source: document_upload",
        f"  last_verified: \"{today}\"",
        "  confidence: provisional",
        "  notes: >",
        "    Extracted from PDF brand guidelines. Some values may need manual correction.",
        "    Verify all colors against actual brand assets.",
        "",
    ]

    # Colors
    lines.append("colors:")
    color_order = ["primary", "secondary", "accent", "background_dark", "background_light",
                   "text_dark", "text_light"]
    for role in color_order:
        val = classified_colors.get(role)
        if val:
            lines.append(f"  {role}: \"{val}\"")
        else:
            lines.append(f"  # {role}: \"\"  # not detected — add manually")

    # List any unclassified colors as extras
    classified_vals = set(classified_colors.values())
    extras = [c["value"] for c in all_colors if c["value"] and c["value"] not in classified_vals]
    if extras:
        lines.append("  # Additional detected colors (classify manually):")
        for e in extras[:8]:
            lines.append(f"  # - \"{e}\"")

    # Pantone references
    pantones = [c.get("pantone") for c in all_colors if c.get("pantone")]
    if pantones:
        lines.append("  # Pantone references detected:")
        for p in pantones[:4]:
            lines.append(f"  # - {p}")

    lines.append("")

    # Typography
    lines.append("typography:")
    heading = fonts.get("heading")
    body = fonts.get("body")
    mono = fonts.get("mono")
    lines.append(f"  heading_font: \"{heading or ''}\"" + ("" if heading else "  # not detected"))
    lines.append(f"  body_font: \"{body or ''}\"" + ("" if body else "  # not detected"))
    if mono:
        lines.append(f"  mono_font: \"{mono}\"")
    lines.append("")

    # Logos
    lines.append("logos:")
    lines.append("  primary: \"\"  # path to primary logo file")
    lines.append("  icon: \"\"    # path to icon/favicon")
    lines.append("  wordmark: \"\" # path to wordmark (text-only logo)")
    lines.append("")

    # Usage rules
    if logo_rules:
        lines.append("usage_rules:")
        if "minimum_clear_space" in logo_rules:
            lines.append(f"  minimum_clear_space: \"{logo_rules['minimum_clear_space']}\"")
        if "prohibited_modifications" in logo_rules:
            lines.append("  prohibited_modifications:")
            for rule in logo_rules["prohibited_modifications"]:
                # Escape quotes
                rule_safe = rule.replace('"', '\\"')
                lines.append(f"    - \"{rule_safe}\"")
        lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def extract(pdf_path, brand_id, output_dir):
    pdf_path = Path(pdf_path).resolve()
    if not pdf_path.exists():
        print(f"Error: file not found: {pdf_path}")
        sys.exit(1)

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    lib = detect_pdf_library()
    print(f"Extracting brand elements from: {pdf_path.name}")
    print(f"Using PDF library: {lib}")

    text = extract_text(pdf_path, lib)
    print(f"Extracted {len(text):,} characters of text")

    all_colors = extract_colors(text)
    classified_colors = classify_colors(all_colors, text)
    fonts = extract_fonts(text)
    logo_rules = extract_logo_rules(text)

    print(f"\nDetected:")
    print(f"  Colors: {len(all_colors)} ({len(classified_colors)} classified)")
    print(f"  Fonts:  {fonts}")
    print(f"  Logo rules: {len(logo_rules)} found")

    yaml_content = build_visual_identity_yaml(
        brand_id, classified_colors, all_colors, fonts, logo_rules
    )

    output_path = output_dir / "visual-identity.yaml"
    output_path.write_text(yaml_content)

    print(f"\nDraft written to: {output_path}")
    print("\n⚠  Review required:")
    print("  - Verify all hex colors against actual brand assets")
    print("  - Add logo file paths manually")
    print("  - Check font names are exact (case-sensitive)")
    print("  - Translate Pantone references to hex if needed")

    return str(output_path)


def main():
    parser = argparse.ArgumentParser(
        description="Extract brand elements from a PDF for MaC Company Manager"
    )
    parser.add_argument("pdf_path", help="Path to the brand guidelines PDF")
    parser.add_argument(
        "--brand-id",
        default="brand",
        help="Brand ID for the output YAML metadata (kebab-case)",
    )
    parser.add_argument(
        "--output",
        default=".",
        help="Output directory for visual-identity.yaml",
    )
    args = parser.parse_args()

    check_dependency()
    extract(
        pdf_path=args.pdf_path,
        brand_id=args.brand_id,
        output_dir=args.output,
    )


if __name__ == "__main__":
    main()
