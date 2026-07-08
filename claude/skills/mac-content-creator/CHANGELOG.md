## [2.1.1] - 2026-06-28
- Fix four pre-existing P2 renderer bugs (BEA-173; surfaced by Codex on PR #125):
  - Remotion SSR helper (`scripts/render_remotion_ssr.mjs`) now resolves `@remotion/bundler`/`@remotion/renderer` from the project's `node_modules` via `createRequire`, and defaults `--project` to the bundled project — SSR no longer fails after the documented `npm install`.
  - Example spec (`renderers/video/remotion/examples/video-spec.example.json`) rewritten to match the component's actual Zod schema (`meta`/`brand`/`scenes` with `startFrame`/`durationInFrames`); set to a non-default 1280×720/240-frame spec.
  - Composition (`project/src/root.tsx` + `compositions/video-from-spec.tsx`) derives duration/fps/dimensions from `inputProps` via `calculateMetadata` — non-default specs render at their requested size/length instead of the 1920×1080/300-frame default.
  - PPTX slide duplication (`renderers/pptx/scripts/rearrange.py`) now copies/remaps EVERY relationship referenced by a duplicated shape (charts, hyperlinks, embedded objects), not just image/media — duplicated slides no longer carry dangling rIds.

## [2.0.0] - 2026-04-25
- Renamed from document-creator (v1.5.0) to mac-content-creator (v2.0.0).
- Shared company pack path: reads context from `~/.claude/mac/companies/{id}/` (MaC Company Manager output).
- MaC MCP server detection: uses governed brand/messaging context if a MaC MCP server is connected.
- Registry self-update: checks mac-registry on session start, announces upgrades.
- Full MaC schema consumption: reads company.yaml + brands/{id}/voice.yaml + tone-guidelines.yaml + terminology.yaml + messaging/ + visual-identity.yaml + audiences/.
- Writer profile application: load archetype, use-case, or personal profiles; applies authorship weight (ghostwritten/collaborative/self-authored).
- Brand-aware Remotion video spec: maps visual-identity.yaml fields to video-spec.json brand block.
- Copy generation §5: brand voice, tone, terminology, pillars, proof points, value props all applied before writing.
- §10 Sync/refresh/offline: matches GTM Strategist §17 pattern.
- Legacy brand-pack.yaml fully supported for backward compatibility (Kymata and document-creator packs).
- Migration path documented in §0 Step 2: cp -r legacy path → shared path.
- All v1.5.0 functionality preserved: template-aware generation, icon system, Remotion renderer, OOXML editing.

## [1.5.0] - 2026-03-12
- Add automatic CDN connectivity detection with silent fallback to bundled icons.
- Bundle 216 commonly-used Material Symbol SVGs (228KB) for offline/sandboxed environments.
- Add semantic icon mapping for fallback when requested icon is not in bundled set.
- `batch_get_icons()` now returns structured result with source, errors, and fallback info.
- No user prompts on fallback — fully automatic, noted in output completion block.

## [1.4.0] - 2026-03-12
- Add Material Symbols icon system (4,179 icons from Google CDN).
- Add `scripts/icon_utils.py` for icon download, colorize, SVG-to-PNG pipeline with auto-trim.
- Add `assets/material-symbols-catalog.txt` full icon catalog.
- Add `icons` config section to brand-pack.yaml (system + kymata).
- Support auto and confirm review modes for icon selection.
- Restructure PPTX templates into self-contained folders with manifest.json, content-schema.json, and copy-prompt.md.
- Add template-aware content generation workflow for single-pass document creation.
- Enable cross-skill orchestration (e.g., GTM Strategist generates copy to template spec, mac-content-creator assembles).

## [1.3.0] - 2026-03-06
- Add Remotion video renderer (SSR) and preflight dependency script.
- Import-safe packaging (SKILL.md at zip root).
