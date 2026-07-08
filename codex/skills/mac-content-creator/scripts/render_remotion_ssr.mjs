#!/usr/bin/env node
/*
SSR render helper for Remotion.

Usage:
  node scripts/render_remotion_ssr.mjs \
    --project renderers/video/remotion/project \
    --entry src/index.ts \
    --composition DocumentCreatorVideo \
    --props /path/to/video-spec.json \
    --out /path/to/out.mp4

Notes:
- Requires `npm ci` (or `npm install`) to have been run inside the project directory.
- Uses @remotion/bundler + @remotion/renderer.
*/

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// The bundled Remotion project lives alongside this helper at
// ../renderers/video/remotion/project. Default to it so the documented
// preflight command (which omits --project) resolves correctly.
const DEFAULT_PROJECT = path.resolve(scriptDir, '..', 'renderers', 'video', 'remotion', 'project');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const val = args[i + 1];
    out[key] = val;
    i++;
  }
  return out;
};

const args = parseArgs();
const projectDir = args.project ?? DEFAULT_PROJECT;
const entry = args.entry ?? 'src/index.ts';
const compositionId = args.composition;
const propsPath = args.props;
const outPath = args.out;

if (!compositionId || !propsPath || !outPath) {
  console.error('Missing required args. Need --composition --props --out (--project defaults to the bundled Remotion project)');
  process.exit(1);
}

const absProject = path.resolve(projectDir);
const absEntry = path.resolve(absProject, entry);
const absProps = path.resolve(propsPath);
const absOut = path.resolve(outPath);

if (!fs.existsSync(absEntry)) {
  console.error(`Entry not found: ${absEntry}`);
  process.exit(1);
}
if (!fs.existsSync(absProps)) {
  console.error(`Props JSON not found: ${absProps}`);
  process.exit(1);
}

const inputProps = JSON.parse(fs.readFileSync(absProps, 'utf-8'));

// Resolve the Remotion packages against the PROJECT's node_modules, not this
// helper's location. preflight_video.sh installs deps under the project dir
// (renderers/video/remotion/project), and bare ESM imports here would resolve
// relative to scripts/ — which has no node_modules — so SSR failed with
// "Cannot find package '@remotion/bundler'" even after the documented install.
const projectRequire = createRequire(path.join(absProject, 'package.json'));
let bundle;
let selectComposition;
let renderMedia;
try {
  ({bundle} = projectRequire('@remotion/bundler'));
  ({selectComposition, renderMedia} = projectRequire('@remotion/renderer'));
} catch (err) {
  console.error(
    `Could not load Remotion packages from the project (${absProject}).\n` +
      'Install dependencies first:\n' +
      `  cd "${absProject}" && npm ci   # or: npm install\n` +
      `Underlying error: ${err && err.message ? err.message : err}`
  );
  process.exit(1);
}

const bundleLocation = await bundle({
  entryPoint: absEntry,
  // Enable caching by letting Remotion re-use previous bundles in the temp dir.
  // Additional caching can be added outside this script if needed.
  webpackOverride: (config) => config
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: absOut,
  inputProps
});

console.log(`[OK] rendered ${compositionId} -> ${absOut}`);
