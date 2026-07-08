#!/usr/bin/env python3
"""
Convert SVG logos to PNG for reliable PPTX embedding.

Usage:
    python convert_logo.py <input.svg> <output.png> [--width 300] [--height 100]
    python convert_logo.py --batch <logos_dir> [--width 300]

PPTX files do not reliably embed SVG images. This script converts SVG logos
to PNG format using cairosvg (preferred) or Pillow+cairosvg as fallback.

Dependencies:
    pip install cairosvg Pillow
"""

import argparse
import sys
from pathlib import Path


def convert_svg_to_png(svg_path: str, png_path: str, width: int = None, height: int = None) -> bool:
    """Convert a single SVG file to PNG.

    Args:
        svg_path: Path to input SVG file
        png_path: Path to output PNG file
        width: Optional output width in pixels (maintains aspect ratio if height not set)
        height: Optional output height in pixels

    Returns:
        True if conversion succeeded, False otherwise
    """
    svg_path = Path(svg_path)
    png_path = Path(png_path)

    if not svg_path.exists():
        print(f"Error: SVG file not found: {svg_path}", file=sys.stderr)
        return False

    # Ensure output directory exists
    png_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        import cairosvg

        kwargs = {"url": str(svg_path), "write_to": str(png_path)}
        if width:
            kwargs["output_width"] = width
        if height:
            kwargs["output_height"] = height

        cairosvg.svg2png(**kwargs)
        print(f"Converted: {svg_path} -> {png_path}")
        return True

    except ImportError:
        print("cairosvg not installed. Install with: pip install cairosvg", file=sys.stderr)
        print("Attempting fallback with subprocess + rsvg-convert...", file=sys.stderr)

        try:
            import subprocess

            cmd = ["rsvg-convert", "-f", "png"]
            if width:
                cmd.extend(["-w", str(width)])
            if height:
                cmd.extend(["-h", str(height)])
            cmd.extend(["-o", str(png_path), str(svg_path)])

            subprocess.run(cmd, check=True, capture_output=True)
            print(f"Converted (rsvg-convert): {svg_path} -> {png_path}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("rsvg-convert also not available. Install librsvg or cairosvg.", file=sys.stderr)
            return False

    except Exception as e:
        print(f"Error converting {svg_path}: {e}", file=sys.stderr)
        return False


def batch_convert(logos_dir: str, width: int = None, height: int = None) -> int:
    """Convert all SVG files in a directory to PNG.

    Returns the number of successful conversions.
    """
    logos_dir = Path(logos_dir)
    if not logos_dir.is_dir():
        print(f"Error: Directory not found: {logos_dir}", file=sys.stderr)
        return 0

    svg_files = list(logos_dir.glob("*.svg"))
    if not svg_files:
        print(f"No SVG files found in {logos_dir}", file=sys.stderr)
        return 0

    success = 0
    for svg in svg_files:
        png = svg.with_suffix(".png")
        if convert_svg_to_png(str(svg), str(png), width, height):
            success += 1

    print(f"\nConverted {success}/{len(svg_files)} SVG files to PNG")
    return success


def main():
    parser = argparse.ArgumentParser(
        description="Convert SVG logos to PNG for PPTX embedding.",
        epilog="Dependencies: pip install cairosvg Pillow",
    )

    parser.add_argument("input", nargs="?", help="Input SVG file path")
    parser.add_argument("output", nargs="?", help="Output PNG file path")
    parser.add_argument("--width", type=int, help="Output width in pixels")
    parser.add_argument("--height", type=int, help="Output height in pixels")
    parser.add_argument("--batch", metavar="DIR", help="Convert all SVGs in a directory")

    args = parser.parse_args()

    if args.batch:
        count = batch_convert(args.batch, args.width, args.height)
        sys.exit(0 if count > 0 else 1)
    elif args.input and args.output:
        ok = convert_svg_to_png(args.input, args.output, args.width, args.height)
        sys.exit(0 if ok else 1)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
