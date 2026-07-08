#!/usr/bin/env python3
"""
Extract theme colors and fonts from a PPTX template.

Usage:
    python extract_theme.py template.pptx [--json]

Reads ppt/theme/theme1.xml from the PPTX archive and extracts:
- Color scheme (dk1, dk2, lt1, lt2, accent1-6, hlink, folHlink)
- Font scheme (majorFont, minorFont)

Outputs a human-readable summary (default) or JSON (--json).
"""

import argparse
import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

# OOXML namespaces
NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def extract_theme(pptx_path: str, as_json: bool = False) -> dict:
    """Extract theme colors and fonts from a PPTX file."""
    pptx_path = Path(pptx_path)
    if not pptx_path.exists():
        print(f"Error: File not found: {pptx_path}", file=sys.stderr)
        sys.exit(1)

    result = {"colors": {}, "fonts": {}, "source": str(pptx_path)}

    with zipfile.ZipFile(pptx_path, "r") as zf:
        # Find theme file(s)
        theme_files = [n for n in zf.namelist() if n.startswith("ppt/theme/theme") and n.endswith(".xml")]
        if not theme_files:
            print("Error: No theme XML found in PPTX", file=sys.stderr)
            sys.exit(1)

        theme_xml = zf.read(theme_files[0])
        root = ET.fromstring(theme_xml)

        # Extract color scheme
        clr_scheme = root.find(".//a:clrScheme", NS)
        if clr_scheme is not None:
            result["colors"]["scheme_name"] = clr_scheme.get("name", "unknown")
            color_names = ["dk1", "dk2", "lt1", "lt2", "accent1", "accent2",
                           "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"]
            for name in color_names:
                elem = clr_scheme.find(f"a:{name}", NS)
                if elem is not None:
                    # Color can be sysClr or srgbClr
                    sys_clr = elem.find("a:sysClr", NS)
                    srgb_clr = elem.find("a:srgbClr", NS)
                    if srgb_clr is not None:
                        result["colors"][name] = f"#{srgb_clr.get('val', '000000').upper()}"
                    elif sys_clr is not None:
                        last_clr = sys_clr.get("lastClr", sys_clr.get("val", "000000"))
                        result["colors"][name] = f"#{last_clr.upper()} (system: {sys_clr.get('val', '')})"

        # Extract font scheme
        font_scheme = root.find(".//a:fontScheme", NS)
        if font_scheme is not None:
            result["fonts"]["scheme_name"] = font_scheme.get("name", "unknown")
            for font_type in ["majorFont", "minorFont"]:
                font_elem = font_scheme.find(f"a:{font_type}", NS)
                if font_elem is not None:
                    latin = font_elem.find("a:latin", NS)
                    ea = font_elem.find("a:ea", NS)
                    cs = font_elem.find("a:cs", NS)
                    result["fonts"][font_type] = {
                        "latin": latin.get("typeface", "") if latin is not None else "",
                        "ea": ea.get("typeface", "") if ea is not None else "",
                        "cs": cs.get("typeface", "") if cs is not None else "",
                    }

    if as_json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Theme extracted from: {pptx_path}")
        print(f"\n=== Color Scheme: {result['colors'].get('scheme_name', 'unknown')} ===")
        for k, v in result["colors"].items():
            if k != "scheme_name":
                print(f"  {k:12s}: {v}")
        print(f"\n=== Font Scheme: {result['fonts'].get('scheme_name', 'unknown')} ===")
        for font_type in ["majorFont", "minorFont"]:
            info = result["fonts"].get(font_type, {})
            print(f"  {font_type}: {info.get('latin', 'N/A')} (latin), {info.get('ea', 'N/A')} (ea), {info.get('cs', 'N/A')} (cs)")

    return result


def main():
    parser = argparse.ArgumentParser(description="Extract theme colors and fonts from a PPTX template.")
    parser.add_argument("pptx", help="Path to the PPTX file")
    parser.add_argument("--json", action="store_true", help="Output as JSON instead of human-readable")
    args = parser.parse_args()
    extract_theme(args.pptx, as_json=args.json)


if __name__ == "__main__":
    main()
