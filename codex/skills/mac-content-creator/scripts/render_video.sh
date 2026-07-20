#!/usr/bin/env bash
set -euo pipefail

# Wrapper around render_remotion_ssr.mjs
# Example:
#   bash scripts/render_video.sh --props ./video-spec.json --out ./out.mp4

PROJECT_DIR="renderers/video/remotion/project"
ENTRY="src/index.ts"
COMPOSITION="DocumentCreatorVideo"
PROPS=""
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT_DIR="$2"; shift 2;;
    --entry) ENTRY="$2"; shift 2;;
    --composition) COMPOSITION="$2"; shift 2;;
    --props) PROPS="$2"; shift 2;;
    --out) OUT="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [[ -z "$PROPS" || -z "$OUT" ]]; then
  echo "Missing required args: --props <video-spec.json> --out <output.mp4>"
  exit 1
fi

node scripts/render_remotion_ssr.mjs \
  --project "$PROJECT_DIR" \
  --entry "$ENTRY" \
  --composition "$COMPOSITION" \
  --props "$PROPS" \
  --out "$OUT"
