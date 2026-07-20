#!/usr/bin/env bash
set -euo pipefail

# Preflight for Remotion SSR rendering dependencies.
# This script does NOT install anything; it prints exact commands to run.

OS_NAME="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH_NAME="$(uname -m)"

say() { printf '%s\n' "$*"; }
hr() { say "------------------------------------------------------------"; }

need_cmd() {
  local cmd="$1"
  local label="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    say "[OK] $label: $(command -v "$cmd")"
    return 0
  fi
  say "[MISSING] $label ($cmd)"
  return 1
}

print_node_install() {
  hr
  say "Install Node.js (LTS)"
  case "$OS_NAME" in
    darwin)
      say "  brew install node"
      ;;
    linux)
      say "  # Ubuntu/Debian (may be older; prefer NodeSource for newer)"
      say "  sudo apt-get update && sudo apt-get install -y nodejs npm"
      ;;
    msys*|mingw*|cygwin*)
      say "  winget install OpenJS.NodeJS.LTS"
      ;;
    *)
      say "  Install Node.js LTS from nodejs.org"
      ;;
  esac
}

print_ffmpeg_install() {
  hr
  say "Install FFmpeg"
  case "$OS_NAME" in
    darwin)
      say "  brew install ffmpeg"
      ;;
    linux)
      say "  sudo apt-get update && sudo apt-get install -y ffmpeg"
      ;;
    msys*|mingw*|cygwin*)
      say "  winget install Gyan.FFmpeg"
      ;;
    *)
      say "  Install FFmpeg for your OS (ensure 'ffmpeg' is on PATH)"
      ;;
  esac
}

print_linux_browser_deps_hint() {
  if [[ "$OS_NAME" != "linux" ]]; then
    return 0
  fi
  hr
  say "Linux note: if rendering fails with missing shared libraries (GTK/NSS/etc.), install common browser deps."
  say "Typical Ubuntu/Debian commands (adjust for your distro):"
  say "  sudo apt-get update && sudo apt-get install -y \\\n    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \\\n    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \\\n    libpangocairo-1.0-0 libpango-1.0-0 libcairo2 libgtk-3-0"
}

say "Remotion video renderer preflight"
say "OS=$OS_NAME ARCH=$ARCH_NAME"
hr

missing=0

if ! need_cmd node "Node.js"; then
  missing=1
  print_node_install
else
  say "[INFO] node version: $(node -v)"
fi

if ! need_cmd npm "npm"; then
  missing=1
  say "[INFO] npm typically installs with Node.js"
fi

if ! need_cmd ffmpeg "FFmpeg"; then
  missing=1
  print_ffmpeg_install
else
  say "[INFO] ffmpeg version: $(ffmpeg -version | head -n 1)"
fi

print_linux_browser_deps_hint

hr
# Remotion project dependency check
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../renderers/video/remotion/project" && pwd)"

if [[ -f "$PROJECT_DIR/package.json" ]]; then
  say "[OK] Remotion project found: $PROJECT_DIR"
else
  say "[MISSING] Remotion project not found at expected path: $PROJECT_DIR"
  say "          Ensure the skill package includes renderers/video/remotion/project"
  exit 2
fi

if [[ $missing -ne 0 ]]; then
  hr
  say "Preflight failed: install missing dependencies above, then re-run this script."
  exit 1
fi

hr
say "Next steps (install project deps):"
say "  cd \"$PROJECT_DIR\""
if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
  say "  npm ci"
else
  say "  npm install"
fi
say ""
say "Then render a test video (example):"
say "  cd \"$SCRIPT_DIR/..\""
say "  node scripts/render_remotion_ssr.mjs \\\n    --composition DocumentCreatorVideo \\\n    --props ./renderers/video/remotion/examples/video-spec.example.json \\\n    --out ./outputs/video.mp4"
