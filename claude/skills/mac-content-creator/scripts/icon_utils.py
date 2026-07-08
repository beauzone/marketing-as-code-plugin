"""
icon_utils.py - Material Symbols icon download, coloring, and SVG-to-PNG conversion.

Downloads icons from Google's Material Symbols CDN, applies brand colors,
and converts to PNG for embedding in documents (PPTX, PDF, etc.).

Includes automatic CDN connectivity detection and silent fallback to a
bundled icon subset (40 icons) when network access is unavailable.

Part of the document-creator skill. Works with any company brand pack --
pass icon_color from the resolved brand-pack.yaml.
"""

import os
import re
import shutil
import urllib.request
import tempfile
import logging

logger = logging.getLogger(__name__)

# Material Symbols CDN settings (configurable per brand pack)
ICON_CDN_BASE = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined"
ICON_WEIGHT = "wght200"
ICON_SIZE = "48px"
DEFAULT_ICON_COLOR = "#333333"  # Neutral default; override with brand color
ICON_PNG_RESOLUTION = 200  # pixels (high-res for crisp rendering)

# Bundled icon JSON file (relative to this script) — all 216 SVGs in one file
BUNDLED_ICONS_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "bundled-icons.json")

# Cache for loaded bundled icons
_bundled_icons_cache = None

# Semantic mapping for fallback: when the requested icon isn't in the
# 216-icon bundled set, map to the closest bundled alternative.
# Only needed for icons outside the bundled set.
_FALLBACK_SEMANTIC_MAP = {
    # People variants -> nearest bundled
    "person_add": "group_add", "person_remove": "manage_accounts",
    "person_search": "manage_accounts", "people_alt": "groups",
    "group_work": "groups", "groups_3": "groups_2",
    "diversity_1": "diversity_3", "diversity_2": "diversity_3",
    "diversity_4": "diversity_3", "face": "person",
    "sentiment_satisfied": "thumb_up", "emoji_people": "groups",
    # Security variants
    "vpn_lock": "vpn_key", "lock_open": "lock", "shield_moon": "shield",
    "enhanced_encryption": "https", "encrypted": "lock",
    # Data variants
    "data_thresholding": "data_object", "data_array": "data_object",
    "leaderboard": "bar_chart", "waterfall_chart": "bar_chart",
    "candlestick_chart": "show_chart", "multiline_chart": "stacked_line_chart",
    "donut_large": "pie_chart", "donut_small": "pie_chart",
    # Cloud variants
    "cloud_upload": "cloud", "cloud_download": "cloud_done",
    "cloud_off": "cloud", "backup": "cloud_sync",
    # Communication variants
    "chat_bubble": "chat", "sms": "chat", "message": "email",
    "mark_email_read": "email", "send": "email",
    "call": "phone", "contact_phone": "phone",
    # Business variants
    "shopping_bag": "shopping_cart", "local_mall": "store",
    "receipt": "receipt_long", "money": "savings",
    "price_check": "payments", "request_quote": "receipt_long",
    # Documents variants
    "note_add": "description", "post_add": "article",
    "file_copy": "description", "file_present": "description",
    "library_books": "article", "menu_book": "article",
    # Navigation
    "arrow_right": "arrow_forward", "arrow_left": "arrow_back",
    "arrow_upward": "expand_less", "arrow_downward": "expand_more",
    "north_east": "arrow_outward", "launch": "open_in_new",
    # Status variants
    "error_outline": "error", "warning_amber": "warning",
    "help_outline": "help", "report_problem": "warning",
    "new_releases": "notification_important",
    # Engineering variants
    "developer_mode": "code", "data_array": "code",
    "source": "code", "integration_instructions": "api",
    "webhook": "api", "developer_board": "terminal",
    # Time variants
    "access_time": "schedule", "timer_off": "timer",
    "hourglass_bottom": "hourglass_top", "hourglass_empty": "hourglass_top",
    # Growth variants
    "trending_down": "trending_up", "trending_flat": "trending_up",
    "moving": "arrow_outward", "north": "trending_up",
    # Sustainability variants
    "park": "nature", "forest": "nature", "grass": "nature",
    "solar_power": "eco", "wind_power": "eco",
    # Misc
    "rate_review": "grade", "thumb_down": "thumb_up",
    "turned_in": "bookmark", "label": "flag",
    "outlined_flag": "flag", "explore": "travel_explore",
    "map": "public", "globe": "language",
}

# Cache the connectivity check result for the session
_cdn_available = None


def check_cdn_connectivity(timeout: float = 3.0) -> bool:
    """
    Check if the Material Symbols CDN is reachable.

    Tests by fetching a tiny known icon. Result is cached for the session
    so this only runs once.

    Args:
        timeout: Connection timeout in seconds.

    Returns:
        True if CDN is reachable, False otherwise.
    """
    global _cdn_available
    if _cdn_available is not None:
        return _cdn_available

    test_url = f"{ICON_CDN_BASE}/check_circle/{ICON_WEIGHT}/{ICON_SIZE}.svg"
    try:
        req = urllib.request.Request(test_url, method='HEAD')
        urllib.request.urlopen(req, timeout=timeout)
        _cdn_available = True
        logger.info("Icon CDN connectivity: OK (full 4,179 icon library available)")
    except Exception:
        _cdn_available = False
        logger.warning("Icon CDN connectivity: FAILED (using bundled icon fallback)")

    return _cdn_available


def _load_bundled_icons() -> dict:
    """Load the bundled icons JSON (cached after first call)."""
    global _bundled_icons_cache
    if _bundled_icons_cache is not None:
        return _bundled_icons_cache

    import json
    if not os.path.isfile(BUNDLED_ICONS_JSON):
        _bundled_icons_cache = {}
        return _bundled_icons_cache

    with open(BUNDLED_ICONS_JSON, 'r') as f:
        _bundled_icons_cache = json.load(f)
    logger.info(f"Loaded {len(_bundled_icons_cache)} bundled icons from JSON")
    return _bundled_icons_cache


def get_bundled_icon_names() -> set:
    """Return the set of icon names available in the bundled fallback set."""
    return set(_load_bundled_icons().keys())


def find_fallback_icon(icon_name: str) -> str:
    """
    Find the best bundled fallback for a requested icon name.

    Checks:
    1. Exact match in bundled set
    2. Semantic mapping to a bundled icon
    3. Generic fallback (lightbulb)

    Returns:
        The bundled icon name to use.
    """
    bundled = get_bundled_icon_names()

    # Exact match
    if icon_name in bundled:
        return icon_name

    # Semantic mapping
    mapped = _FALLBACK_SEMANTIC_MAP.get(icon_name)
    if mapped and mapped in bundled:
        logger.info(f"Fallback: {icon_name} -> {mapped} (semantic match)")
        return mapped

    # Generic fallback
    logger.info(f"Fallback: {icon_name} -> lightbulb (no match found)")
    return "lightbulb"


def get_bundled_svg_path(icon_name: str, output_dir: str = None) -> str:
    """Extract a bundled SVG icon to a temp file and return the path."""
    icons = _load_bundled_icons()
    if icon_name not in icons:
        raise ValueError(f"Bundled icon not found: {icon_name}")

    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="docgen_icons_")
    os.makedirs(output_dir, exist_ok=True)

    svg_path = os.path.join(output_dir, f"{icon_name}.svg")
    with open(svg_path, 'w') as f:
        f.write(icons[icon_name])
    return svg_path


def load_icon_catalog(catalog_path: str) -> set:
    """Load the Material Symbols catalog (4,179 icon names)."""
    with open(catalog_path, 'r') as f:
        return {line.strip() for line in f if line.strip()}


def validate_icon_name(name: str, catalog: set) -> bool:
    """Check if an icon name exists in the Material Symbols catalog."""
    return name.lower().strip() in catalog


def get_icon_url(icon_name: str) -> str:
    """Get the CDN download URL for a Material Symbol icon SVG."""
    return f"{ICON_CDN_BASE}/{icon_name}/{ICON_WEIGHT}/{ICON_SIZE}.svg"


def download_icon_svg(icon_name: str, output_dir: str = None) -> str:
    """
    Download a Material Symbol icon as SVG from Google CDN.

    Args:
        icon_name: Material Symbol name (e.g., 'psychology', 'verified_user')
        output_dir: Directory to save SVG. Uses temp dir if None.

    Returns:
        Path to downloaded SVG file.

    Raises:
        ValueError: If icon download fails (likely invalid name).
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="docgen_icons_")

    os.makedirs(output_dir, exist_ok=True)
    svg_path = os.path.join(output_dir, f"{icon_name}.svg")

    url = get_icon_url(icon_name)
    try:
        urllib.request.urlretrieve(url, svg_path)
        if os.path.getsize(svg_path) < 50:
            raise ValueError(f"Downloaded file too small - likely invalid icon name: {icon_name}")
        logger.info(f"Downloaded {icon_name}.svg ({os.path.getsize(svg_path)} bytes)")
        return svg_path
    except Exception as e:
        raise ValueError(f"Failed to download icon '{icon_name}': {e}")


def resolve_icon_svg(icon_name: str, output_dir: str = None) -> tuple:
    """
    Resolve an icon to an SVG path, using CDN or bundled fallback.

    This is the smart resolution function that handles connectivity
    detection and fallback automatically.

    Args:
        icon_name: Requested Material Symbol name.
        output_dir: Directory for downloaded SVGs.

    Returns:
        Tuple of (svg_path, actual_icon_name, source) where source is
        'cdn' or 'bundled'.
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="docgen_icons_")
    os.makedirs(output_dir, exist_ok=True)

    # Try CDN first
    if check_cdn_connectivity():
        try:
            svg_path = download_icon_svg(icon_name, output_dir)
            return svg_path, icon_name, "cdn"
        except ValueError:
            logger.warning(f"CDN download failed for '{icon_name}', trying bundled fallback")

    # Bundled fallback
    fallback_name = find_fallback_icon(icon_name)
    svg_path = get_bundled_svg_path(fallback_name, output_dir)
    return svg_path, fallback_name, "bundled"


def colorize_svg(svg_path: str, color: str = DEFAULT_ICON_COLOR) -> str:
    """
    Apply a fill color to an SVG file (in-place).

    Material Symbol SVGs use <path> elements with no fill (defaults to black).
    This adds an explicit fill attribute with the desired color.

    Args:
        svg_path: Path to SVG file.
        color: Hex color string (e.g., '#096E8C').

    Returns:
        Path to the modified SVG (same as input, modified in-place).
    """
    with open(svg_path, 'r') as f:
        svg_content = f.read()

    # Remove any existing fill attributes on path elements, then add our color
    svg_content = re.sub(r'(<path\s)', rf'\1fill="{color}" ', svg_content)

    with open(svg_path, 'w') as f:
        f.write(svg_content)

    logger.info(f"Applied color {color} to {os.path.basename(svg_path)}")
    return svg_path


def trim_png_whitespace(png_path: str, padding: int = 4) -> str:
    """
    Trim transparent padding from a PNG, keeping a small uniform margin.

    Material Symbols icons have ~25-35% padding on each side.
    This crops to the visible content bounds, then re-expands with
    minimal uniform padding to maintain a square aspect ratio.

    Args:
        png_path: Path to PNG file (modified in-place).
        padding: Pixels of padding to keep around content.

    Returns:
        Path to the trimmed PNG (same as input).
    """
    from PIL import Image

    img = Image.open(png_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    bbox = img.getbbox()
    if bbox is None:
        logger.warning(f"No visible content in {png_path}")
        return png_path

    # Crop to content
    content = img.crop(bbox)
    content_w, content_h = content.size

    # Make square (use the larger dimension)
    side = max(content_w, content_h) + (padding * 2)

    # Create new square image with transparent background
    result = Image.new('RGBA', (side, side), (0, 0, 0, 0))

    # Center the content
    paste_x = (side - content_w) // 2
    paste_y = (side - content_h) // 2
    result.paste(content, (paste_x, paste_y))

    result.save(png_path)
    logger.info(f"Trimmed {os.path.basename(png_path)}: {img.size} -> {result.size} (content {content_w}x{content_h})")
    return png_path


def svg_to_png(svg_path: str, png_path: str = None,
               width: int = ICON_PNG_RESOLUTION,
               height: int = ICON_PNG_RESOLUTION,
               auto_trim: bool = True) -> str:
    """
    Convert SVG to PNG using cairosvg, with optional auto-trimming.

    Args:
        svg_path: Path to input SVG.
        png_path: Path for output PNG. Auto-generated if None.
        width: Output width in pixels.
        height: Output height in pixels.
        auto_trim: If True, trim transparent padding after conversion.

    Returns:
        Path to the generated PNG file.
    """
    import cairosvg

    if png_path is None:
        png_path = svg_path.rsplit('.', 1)[0] + '.png'

    cairosvg.svg2png(
        url=svg_path,
        write_to=png_path,
        output_width=width,
        output_height=height,
    )

    if auto_trim:
        trim_png_whitespace(png_path)

    logger.info(f"Converted {os.path.basename(svg_path)} -> {os.path.basename(png_path)} ({width}x{height})")
    return png_path


def get_icon_png(icon_name: str, color: str = DEFAULT_ICON_COLOR,
                 output_dir: str = None, cache: bool = True) -> str:
    """
    Full pipeline: Resolve icon SVG (CDN or bundled) -> colorize -> convert to PNG.

    This is the main entry point for getting a ready-to-embed icon PNG.
    Automatically detects CDN availability and falls back to bundled icons.

    Args:
        icon_name: Material Symbol name.
        color: Hex color to apply.
        output_dir: Directory for output files.
        cache: If True, skip download if PNG already exists.

    Returns:
        Path to the final PNG file.
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="docgen_icons_")

    os.makedirs(output_dir, exist_ok=True)
    png_path = os.path.join(output_dir, f"{icon_name}.png")

    # Cache check
    if cache and os.path.exists(png_path) and os.path.getsize(png_path) > 100:
        logger.info(f"Using cached {icon_name}.png")
        return png_path

    # Resolve SVG (CDN or bundled fallback)
    svg_path, actual_name, source = resolve_icon_svg(icon_name, output_dir)

    # If fallback used a different icon name, adjust png_path
    if actual_name != icon_name:
        png_path = os.path.join(output_dir, f"{icon_name}_via_{actual_name}.png")

    colorize_svg(svg_path, color)
    svg_to_png(svg_path, png_path)

    # Clean up SVG
    try:
        os.remove(svg_path)
    except OSError:
        pass

    return png_path


def batch_get_icons(icon_specs: list, output_dir: str = None) -> dict:
    """
    Download and convert multiple icons.

    Automatically detects CDN availability once, then processes all icons
    using CDN or bundled fallback as appropriate.

    Args:
        icon_specs: List of dicts with 'name' and optional 'color' keys.
                    e.g., [{'name': 'psychology', 'color': '#096E8C'}, ...]
        output_dir: Directory for all output files.

    Returns:
        Dict with results:
        {
            'icons': {'psychology': '/tmp/icons/psychology.png', ...},
            'source': 'cdn' or 'bundled',
            'errors': ['icon_name: error message', ...],
            'fallbacks': {'requested': 'actual', ...}
        }
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp(prefix="docgen_icons_")

    # Pre-check connectivity once for the batch
    cdn_ok = check_cdn_connectivity()
    source = "cdn" if cdn_ok else "bundled"

    icons = {}
    errors = []
    fallbacks = {}

    for spec in icon_specs:
        name = spec['name']
        color = spec.get('color', DEFAULT_ICON_COLOR)
        try:
            png_path = get_icon_png(name, color=color, output_dir=output_dir)
            icons[name] = png_path

            # Track fallbacks
            if not cdn_ok:
                actual = find_fallback_icon(name)
                if actual != name:
                    fallbacks[name] = actual
        except Exception as e:
            errors.append(f"{name}: {e}")
            logger.error(f"Failed to get icon {name}: {e}")

    if errors:
        logger.warning(f"Icon errors: {errors}")
    if fallbacks:
        logger.info(f"Icon fallbacks used: {fallbacks}")

    return {
        "icons": icons,
        "source": source,
        "errors": errors,
        "fallbacks": fallbacks,
    }


# Quick test
if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)

    icon_name = sys.argv[1] if len(sys.argv) > 1 else "psychology"
    color = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_ICON_COLOR

    # Test connectivity
    cdn_ok = check_cdn_connectivity()
    print(f"CDN available: {cdn_ok}")
    print(f"Bundled icons: {len(get_bundled_icon_names())}")

    png = get_icon_png(icon_name, color=color, output_dir="/tmp/icon_test")
    print(f"OK {icon_name} -> {png} ({os.path.getsize(png)} bytes)")
