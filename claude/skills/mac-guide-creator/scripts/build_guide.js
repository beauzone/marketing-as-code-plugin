/*
 * mac-guide-creator — personalized MaC Getting Started Guide builder.
 *
 * Usage:  node build_guide.js <config.json> <output.docx>
 *
 * config.json shape:
 * {
 *   "user_name": "Debasree Panda",
 *   "user_email": "debasree@imesh.ai",
 *   "user_title": "Chief Executive Officer",        // optional, shown on cover
 *   "companies": [                                   // one or more
 *     { "slug": "imesh", "display_name": "iMesh", "role": "owner" }
 *   ],
 *   "server_url": "https://mcp-server-production-131d.up.railway.app/mcp", // optional
 *   "date_label": "June 2026",                       // optional, defaults to current month/year
 *   "edition": "1.0",                                // optional
 *   "confidential_label": "Confidential — internal use", // optional
 *   "guide_content": { ... }                         // optional — see below (BEA-171)
 * }
 *
 * Roles: viewer | editor | owner | admin  (admin == platform admin)
 * Tool groups are gated by the user's HIGHEST role across their companies.
 *
 * guide_content (BEA-171 — renderer hooks, no more hardcoded prose/tool tables)
 * ------------------------------------------------------------------------------
 * This script no longer owns the prose sections or the tool/skill listings —
 * it RENDERS them from the server's structured content bundle instead, so a new
 * server tool or a newly published skill shows up here with no skill edit.
 *
 * The caller (the skill user's assistant, which already has an authenticated
 * MCP session and calls `whoami`/`list_company_users` directly per this
 * skill's existing cross-check step) is expected to call:
 *
 *     get_user_guide(format="structured", audience_role=<recipient's role>)
 *
 * and embed the JSON result verbatim as `guide_content.prose_sections` /
 * `.tool_catalog` / `.skills` / `.help_version`, plus `guide_content.source =
 * "live"` and `guide_content.fetched_at`. `audience_role` should be the
 * recipient's own highest company role (viewer|editor|owner) — NOT "admin":
 * the server's audience_role can never preview platform-admin-only tools for
 * anyone but the real, currently-authenticated platform admin, so for a
 * recipient whose role IS platform admin, fetch with audience_role="owner"
 * (the highest tier the live catalog can represent for someone else) and let
 * this script's existing static "Administration" note cover the rest, exactly
 * as before this change — see references/config-schema.md.
 *
 * If `guide_content` is omitted entirely (no MCP connector available), this
 * script falls back to the bundled offline snapshot
 * (references/guide-content.snapshot.json) and marks the guide with a visible
 * staleness warning — it never blocks the build.
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TabStopType, TabStopPosition, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
} = require("docx");

// ---------------------------------------------------------------- config
const configPath = process.argv[2];
const outPath = process.argv[3] || "MaC-Getting-Started-Guide.docx";
if (!configPath || !fs.existsSync(configPath)) {
  console.error("ERROR: provide a config JSON path. Usage: node build_guide.js <config.json> <output.docx>");
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

// validation
const ROLE_RANK = { viewer: 1, editor: 2, owner: 3, admin: 4 };
const ROLE_LABEL = { viewer: "Viewer", editor: "Editor", owner: "Owner", admin: "Platform Admin" };
function fail(msg) { console.error("CONFIG ERROR: " + msg); process.exit(1); }
if (!cfg.user_name) fail("user_name is required.");
if (!cfg.user_email) fail("user_email is required.");
if (!Array.isArray(cfg.companies) || cfg.companies.length === 0) fail("companies must be a non-empty array.");
cfg.companies.forEach((c, i) => {
  if (!c.slug) fail(`companies[${i}].slug is required.`);
  if (!c.display_name) c.display_name = c.slug;
  if (!c.role || !(c.role in ROLE_RANK)) fail(`companies[${i}].role must be one of viewer|editor|owner|admin (got '${c.role}').`);
});
const URL = cfg.server_url || "https://mcp-server-production-131d.up.railway.app/mcp";
// Public plugin distribution repo (BEA-172 follow-up). Mirrors just the
// assembled extensions/plugins/{claude,codex} bundles from the private
// beauzone/marketing-as-code source repo — no platform internals, no other
// company data — so any company's users can add it as a marketplace without
// needing GitHub access to the private repo. See its README for the
// zip-upload fallback (Releases page) used when someone can't/won't add a
// marketplace at all.
const PLUGIN_REPO = cfg.plugin_repo || "beauzone/marketing-as-code-plugin";
const DATE_LABEL = cfg.date_label || new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
const EDITION = cfg.edition || "1.0";
const CONF = cfg.confidential_label || "Confidential — internal use";

const maxRank = Math.max(...cfg.companies.map((c) => ROLE_RANK[c.role]));
const isAdmin = maxRank >= 4;
const can = (minRole) => maxRank >= ROLE_RANK[minRole];
const primary = cfg.companies.slice().sort((a, b) => ROLE_RANK[b.role] - ROLE_RANK[a.role])[0];
const multi = cfg.companies.length > 1;

// ---------------------------------------------------------------- guide content (BEA-171)
// Live bundle from get_user_guide(format="structured", ...), embedded by the caller,
// or (if absent) the bundled offline snapshot — never blocks the build either way.
let guideContent = cfg.guide_content;
if (!guideContent) {
  const snapshotPath = path.join(__dirname, "..", "references", "guide-content.snapshot.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  guideContent = Object.assign({}, snapshot, { source: "snapshot" });
  console.warn(
    "WARNING: no live guide_content supplied — falling back to the bundled snapshot " +
    `(captured ${snapshot.snapshot_captured_at || "unknown date"}, help_version ${snapshot.help_version || "unknown"}). ` +
    "Tool and skill listings in this guide may be stale."
  );
}
const isLive = guideContent.source === "live";
const EXCLUDED_TOPIC_IDS = new Set(["connecting", "using-tools"]);
const sectionsById = new Map(
  (guideContent.prose_sections || [])
    .filter((s) => !EXCLUDED_TOPIC_IDS.has(s.id))
    .map((s) => [s.id, s])
);

// ---------------------------------------------------------------- palette + helpers
const BLUE = "1F6FB2", DARK = "1A2733", GREY = "5B6770", LIGHT = "EAF2F8", CODEBG = "F2F4F5";
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const t = (text, opts = {}) => new TextRun({ text, ...opts });
const b = (text) => new TextRun({ text, bold: true });
const P = (text, opts = {}) => new Paragraph({ spacing: { after: 140, line: 276 }, children: typeof text === "string" ? [new TextRun({ text, ...opts })] : text });
const bullet = (text, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, spacing: { after: 60, line: 268 }, children: typeof text === "string" ? [new TextRun(text)] : text });
const numbered = (text) => new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80, line: 268 }, children: typeof text === "string" ? [new TextRun(text)] : text });
const spacer = () => new Paragraph({ spacing: { after: 60 }, children: [new TextRun("")] });

// Running section counter — every top-level ("1.", "2." …) heading, whether
// hardcoded or rendered from live content, goes through this so numbering
// stays sequential regardless of how many live topics come back. Each
// title is also recorded in tocEntries so the Contents page (built further
// down, once every title is known) can list it — see the Contents section
// for why this replaced a live TableOfContents field. (Tried wrapping each
// heading in docx's Bookmark for clickable Contents links first, but that
// class assigns every instance the same internal numeric id — 1 — so two+
// bookmarks in one document fail OOXML id-uniqueness validation. Plain
// static text sidesteps that bug entirely.)
let sectionCounter = 0;
const tocEntries = [];
const S1 = (title) => {
  sectionCounter++;
  tocEntries.push({ num: sectionCounter, title });
  return H1(`${sectionCounter}. ${title}`);
};

const code = (text) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9360, type: WidthType.DXA }, shading: { fill: CODEBG, type: ShadingType.CLEAR },
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: "D5DBDE" }, left: { style: BorderStyle.SINGLE, size: 12, color: BLUE }, bottom: { style: BorderStyle.SINGLE, size: 2, color: "D5DBDE" }, right: { style: BorderStyle.SINGLE, size: 2, color: "D5DBDE" } },
    margins: { top: 90, bottom: 90, left: 160, right: 140 },
    children: text.split("\n").map((line) => new Paragraph({ children: [new TextRun({ text: line, font: "Consolas", size: 19 })] })),
  })] })],
});

const callout = (label, lines, fill = LIGHT, bar = BLUE) => {
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: label, bold: true, color: DARK })] })];
  lines.forEach((l, i) => kids.push(new Paragraph({ spacing: { after: i === lines.length - 1 ? 0 : 60, line: 268 }, children: typeof l === "string" ? [new TextRun(l)] : l })));
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR },
      borders: { top: { style: BorderStyle.SINGLE, size: 2, color: fill }, left: { style: BorderStyle.SINGLE, size: 18, color: bar }, bottom: { style: BorderStyle.SINGLE, size: 2, color: fill }, right: { style: BorderStyle.SINGLE, size: 2, color: fill } },
      margins: { top: 120, bottom: 120, left: 200, right: 160 }, children: kids,
    })] })],
  });
};

const toolTable = (rows) => {
  const widths = [2200, 3680, 3480];
  const headerCells = ["Tool", "What it does", "Try asking…"].map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, shading: { fill: BLUE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 19 })] })],
  }));
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCD4D9" };
  const borders = { top: border, left: border, bottom: border, right: border };
  const bodyRows = rows.map((r, idx) => new TableRow({ children: r.map((cellText, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders,
    shading: idx % 2 ? { fill: "F6F9FB", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 120, right: 120 }, verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({ children:
      i === 0 ? [new TextRun({ text: cellText, font: "Consolas", size: 17, color: BLUE, bold: true })]
      : i === 2 ? [new TextRun({ text: cellText, italics: true, size: 18, color: GREY })]
      : [new TextRun({ text: cellText, size: 18 })] })],
  })) }));
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: headerCells }), ...bodyRows] });
};

const refTable = (headers, widths, rows) => {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCD4D9" };
  const borders = { top: border, left: border, bottom: border, right: border };
  const headerCells = headers.map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 19 })] })],
  }));
  const bodyRows = rows.map((r, idx) => new TableRow({ children: r.map((cellText, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders,
    shading: idx % 2 ? { fill: "F6F9FB", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 120, right: 120 }, verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({ children: [new TextRun({ text: cellText, size: 18, font: "Arial", bold: i === 0, color: i === 0 ? DARK : "000000" })] })],
  })) }));
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: headerCells }), ...bodyRows] });
};

// ---------------------------------------------------------------- markdown renderer (BEA-171)
// Renders the governed help corpus's Markdown (help/content/*.md on the
// server) into docx blocks. Tailored to exactly the constructs that corpus
// uses — headings (##/###), bullet/numbered lists, pipe tables, code fences,
// blockquotes, and **bold**/*italic*/`code` inline spans — not a general
// CommonMark implementation.
const stripInlineMarkers = (s) => s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`(.*?)`/g, "$1").replace(/\*(.*?)\*/g, "$1");

function parseInlineRuns(text) {
  const runs = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let last = 0, m;
  const pushPlain = (s) => { if (s) runs.push(new TextRun(s)); };
  while ((m = re.exec(text)) !== null) {
    pushPlain(text.slice(last, m.index));
    if (m[2] !== undefined) runs.push(new TextRun({ text: m[2], bold: true }));
    else if (m[3] !== undefined) runs.push(new TextRun({ text: m[3], font: "Consolas", size: 19, color: BLUE }));
    else if (m[4] !== undefined) runs.push(new TextRun({ text: m[4], italics: true }));
    last = re.lastIndex;
  }
  pushPlain(text.slice(last));
  return runs.length ? runs : [new TextRun(text)];
}

function renderMarkdown(markdown) {
  // Strip HTML comments — the governed corpus uses them as author-facing
  // notes (e.g. using-tools.md marks where the server appends its own
  // rendered catalog); they are never meant to reach the reader.
  const cleaned = (markdown || "").replace(/<!--[\s\S]*?-->/g, "");
  const lines = cleaned.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  const isBlockStart = (line) =>
    line.trim().startsWith("```") ||
    /^#{2,4}\s/.test(line) ||
    line.trim().startsWith("|") ||
    line.trim().startsWith(">") ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line);

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    // code fence
    if (line.trim().startsWith("```")) {
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      i++; // skip closing fence
      out.push(code(codeLines.join("\n")));
      continue;
    }

    // heading
    const hm = line.match(/^(#{2,4})\s+(.*)$/);
    if (hm) {
      const level = hm[1].length;
      out.push(level === 2 ? H2(hm[2].trim()) : H3(hm[2].trim()));
      i++;
      continue;
    }

    // pipe table
    if (line.trim().startsWith("|") && lines[i + 1] && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const splitRow = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => stripInlineMarkers(c.trim()));
      const headerCells = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(splitRow(lines[i])); i++; }
      const total = 9360;
      const base = Math.floor(total / headerCells.length);
      const widths = headerCells.map((_, idx) => (idx === headerCells.length - 1 ? total - base * (headerCells.length - 1) : base));
      out.push(refTable(headerCells, widths, rows));
      continue;
    }

    // blockquote
    if (line.trim().startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { quoteLines.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      out.push(callout("Note", quoteLines.map(parseInlineRuns)));
      continue;
    }

    // bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*]\s+/, "");
        i++;
        while (i < lines.length && lines[i].trim() !== "" && lines[i].startsWith("  ") && !isBlockStart(lines[i])) {
          item += " " + lines[i].trim();
          i++;
        }
        out.push(bullet(parseInlineRuns(item)));
      }
      continue;
    }

    // numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*\d+\.\s+/, "");
        i++;
        while (i < lines.length && lines[i].trim() !== "" && lines[i].startsWith("  ") && !isBlockStart(lines[i])) {
          item += " " + lines[i].trim();
          i++;
        }
        out.push(numbered(parseInlineRuns(item)));
      }
      continue;
    }

    // paragraph — collect consecutive plain lines
    const paraLines = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) {
      paraLines.push(lines[i].trim());
      i++;
    }
    out.push(P(parseInlineRuns(paraLines.join(" "))));
  }
  return out;
}

function renderTopic(id, afterFn) {
  const s = sectionsById.get(id);
  if (!s) return; // topic missing/renamed upstream — skip rather than crash
  children.push(S1(s.title));
  children.push(...renderMarkdown(s.markdown));
  if (afterFn) afterFn();
}

// ---------------------------------------------------------------- content
const children = [];
const c1 = cfg.companies[0];

// COVER
children.push(
  new Paragraph({ spacing: { before: 2600, after: 0 }, children: [new TextRun({ text: "MARKETING AS CODE", bold: true, size: 64, color: BLUE })] }),
  new Paragraph({ spacing: { before: 80, after: 0 }, children: [new TextRun({ text: "Getting Started Guide", size: 40, color: DARK })] }),
  new Paragraph({ spacing: { before: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 8 } }, children: [new TextRun("")] }),
  new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: "Connect your company's brand and marketing intelligence", size: 26, color: GREY })] }),
  new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: "to the AI tools you already use.", size: 26, color: GREY })] }),
  new Paragraph({ spacing: { before: 1500 }, children: [new TextRun({ text: "Prepared for", size: 20, color: GREY })] }),
  new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: cfg.user_name + (cfg.user_title ? " — " + cfg.user_title : ""), size: 26, bold: true, color: DARK })] }),
  new Paragraph({ spacing: { before: 6 }, children: [new TextRun({ text: cfg.user_email, size: 20, color: BLUE, font: "Consolas" })] }),
  new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: `Edition ${EDITION}  ·  ${DATE_LABEL}`, size: 20, color: GREY })] }),
  new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: CONF, size: 18, italics: true, color: GREY })] }),
  new Paragraph({ children: [new PageBreak()] })
);

// QUICK START — sits between the cover and Contents so advanced users can
// connect in under a minute without hunting to Section 4 / page 6. Deliberately
// excluded from S1()/tocEntries (it's a cheat sheet, not a numbered section)
// and limited to Claude and Codex — the only two clients with a genuine
// one-step plugin install. ChatGPT and Cursor have no plugin/marketplace
// system, so a "quick" version of their setup would just restate the full
// steps — those stay in Section 4 only, which this page points to.
children.push(H1("Quick Start — Connect in Under a Minute"));
children.push(P([t("For advanced users on "), b("Claude"), t(" or "), b("Codex"), t(" who just want the commands. For ChatGPT, Cursor, other AI clients, or the full step-by-step walkthrough, skip to "), b("Section 4 — Connecting MaC to Your AI Client"), t(".")]));
children.push(H2("Claude"));
children.push(P([b("Claude Code (terminal):")]));
children.push(code(`/plugin marketplace add ${PLUGIN_REPO}\n/plugin install marketing-as-code@marketing-as-code`));
children.push(P([b("Claude Desktop, web, or Cowork: "), t("Customize → Plugins → “+” → Add marketplace → Add from a repository → "), t(PLUGIN_REPO, { font: "Consolas", size: 19, color: BLUE }), t(" → Browse plugins → Install “marketing-as-code.”")]));
children.push(H2("Codex"));
children.push(P([b("Terminal:")]));
children.push(code(`codex plugin marketplace add ${PLUGIN_REPO}\ncodex plugin add marketing-as-code@marketing-as-code`));
children.push(H2("No marketplace access?"));
children.push(P([t("Download the packaged plugin "), t(".zip", { font: "Consolas", size: 19, color: BLUE }), t(" from "), t(`${PLUGIN_REPO}/releases`, { font: "Consolas", size: 18, color: BLUE }), t(", then in Claude: Customize → Plugins → upload it directly — no GitHub account needed.")]));
children.push(callout("First-time sign-in", ["A browser window opens for Clerk sign-in the first time you connect. Use your exact provisioned email — see Section 3 if you're not sure that's set up yet."]));
children.push(new Paragraph({ children: [new PageBreak()] }));

// TOC — reserved here, populated below once every section title is known.
// A live TableOfContents field is never opened/refreshed in an interactive
// Word/LibreOffice session in this pipeline, so it has no cached result and
// renders as a blank "Contents" page in the headless PDF export. A static
// list of the real section titles (built from tocEntries after all
// renderTopic()/S1() calls have run) is reliable in both docx and PDF.
children.push(H1("Contents"));
const tocPlaceholderIndex = children.length;
children.push(new Paragraph({ children: [new TextRun("")] })); // replaced further down
children.push(new Paragraph({ children: [new PageBreak()] }));

// 1–2: live prose (what-is-mac, concepts) — "getting-started" is rendered
// later, after the Connecting section, since it assumes the reader is
// already connected. The personalized access table is appended after
// "concepts" — kept hardcoded (BEA-171 guardrail: cover, access table, and
// connect steps stay personalized).
renderTopic("what-is-mac");
renderTopic("concepts", () => {
  children.push(H2("Your access"));
  if (multi) {
    children.push(P([t("You have access to the following company packs. Your "), b("role"), t(" on each determines what you can do:")]));
  } else {
    children.push(P([t("You are set up on the "), b(c1.display_name), t(" company pack. Your "), b("role"), t(" determines what you can do:")]));
  }
  const roleMeaning = {
    viewer: "Read access — view brand, strategy, audiences, and the shared library.",
    editor: "Read and write — everything a Viewer can do, plus create and update content and save finished work back to the pack.",
    owner: "Full access — read, create and save content, and view usage analytics for the company.",
    admin: "Platform administrator — full access across companies, plus provisioning and administration.",
  };
  children.push(refTable(
    ["Company", "Your role", "What it means"],
    [2400, 1800, 5160],
    cfg.companies.map((c) => [c.display_name, ROLE_LABEL[c.role], roleMeaning[c.role]])
  ));
  children.push(spacer());
  children.push(P([t("Access is tied to your identity — the AI can only ever see and do what you are permitted to. "), t(can("editor") ? "Because you can write, this guide includes the tools for creating and saving content." : "Your access is read-only, so this guide focuses on reading and using your brand and strategy; creating-and-saving tools are reserved for Editors and Owners.", { italics: true, color: GREY })]));
});

// 3 BEFORE YOU BEGIN — hardcoded: volatile setup facts guarded by
// scripts/check_guide_sync.py (BEA-171 guardrail, keep unchanged).
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(S1("Before You Begin"));
children.push(P("Setup takes about five minutes. Here is what you need in place first."));
children.push(H2("Step 1 — Register and sign in with Clerk"));
children.push(P([t("Access to MaC is secured through a sign-in service called "), b("Clerk"), t(" ("), t("dashboard.clerk.com/sign-up", { font: "Consolas", size: 19, color: BLUE }), t("). The first time you connect, you’ll be asked to sign in. Register using your email address exactly:")]));
children.push(code(cfg.user_email));
children.push(P([b("This must be the exact email. "), t("Your MaC access is linked to that address. If you sign in with a different email, the system won’t recognize your access and you’ll see an empty workspace.")]));
children.push(callout("Already set up for you?", ["Sometimes your MaC administrator pre-provisions your account in Clerk ahead of time. If so, you can skip registering — just sign in and authenticate with Clerk when you connect the MaC plugin or MCP connector."]));
children.push(H2("Step 2 — Choose an AI client"));
children.push(P("MaC works with most major AI assistants. You only need one to start, and you can connect more later. The next section covers each of these:"));
[["Claude", " — web (claude.ai), desktop app, Cowork, and mobile"],
 ["Claude Code", " — Anthropic’s command-line assistant"],
 ["ChatGPT", " — OpenAI’s web app (with Developer Mode)"],
 ["Codex", " — OpenAI’s command-line assistant"],
 ["Cursor", " — the AI code editor"]].forEach(([n, d]) => children.push(bullet([b(n), t(d)])));
children.push(H2("Step 3 — Have the server address handy"));
children.push(P("Every client asks for the same one thing: the MaC server URL. Keep it close — you’ll paste it in once per client."));
children.push(code(URL));

// 4 CONNECTING — hardcoded, same guardrail as Section 3.
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(S1("Connecting MaC to Your AI Client"));
children.push(P("Find your tool below and follow its steps. Each is a one-time setup. The very first time you connect any client, a browser window opens for you to sign in with Clerk (see Section 3) and approve access — after that, it just works."));

children.push(H2("Fastest path: install the MaC plugin (Claude and Codex)"));
children.push(P("If you use Claude or Codex, install MaC as a plugin instead of connecting the server by hand. A plugin bundles the MaC skills and this MCP connection into one step — you get both at once, and Claude/Codex users on the desktop or web app never need a terminal."));
children.push(H3("Option A — Add the marketplace (recommended)"));
children.push(P([t("Point your client at the public MaC plugin repository: "), t(PLUGIN_REPO, { font: "Consolas", size: 19, color: BLUE }), t(". This repo mirrors just the MaC plugin — skills plus the MCP connection — nothing else from the platform.")]));
children.push(P([b("Claude Code (terminal):")]));
children.push(code(`/plugin marketplace add ${PLUGIN_REPO}\n/plugin install marketing-as-code@marketing-as-code`));
children.push(P([b("Claude Desktop, web, or Cowork (no terminal):")]));
children.push(numbered("Open the Customize menu in the left sidebar, then the Plugins tab."));
children.push(numbered([t("In the Personal plugins section, click the "), b("+"), t(" button, then choose Add marketplace.")]));
children.push(numbered([t("Choose Add from a repository, enter "), t(PLUGIN_REPO, { font: "Consolas", size: 19, color: BLUE }), t(", and click Add, then Done.")]));
children.push(numbered("Click Browse plugins, find “marketing-as-code,” and click Install."));
children.push(P([b("Codex (terminal):")]));
children.push(code(`codex plugin marketplace add ${PLUGIN_REPO}\ncodex plugin add marketing-as-code@marketing-as-code`));
children.push(spacer());
children.push(H3("Option B — Upload a plugin file directly"));
children.push(P([t("No GitHub account, and no marketplace needed: if your MaC admin sent you a packaged plugin "), t(".zip", { font: "Consolas", size: 19, color: BLUE }), t(" file directly (or you grabbed one from the "), t(`${PLUGIN_REPO}/releases`, { font: "Consolas", size: 18, color: BLUE }), t(" page), install it the same way: Customize menu → Plugins tab → upload the file. If no packaged file is listed yet, ask your MaC admin for one.")]));
children.push(callout("Only for Claude and Codex", ["ChatGPT and Cursor don't have a plugin/marketplace system, so they always connect to MaC the direct way — see their sections below. If you use Claude or Codex but the plugin path doesn't work for you (e.g. it's blocked by an admin policy), the direct connection steps below work too — you'll just set up the skills separately."]));

children.push(H2("Quick reference"));
children.push(refTable(
  ["AI Client", "Where you add it", "Sign-in", "Plugin available?"],
  [2000, 3760, 2000, 1600],
  [
    ["Claude (web/desktop)", "Customize › Plugins, or Settings › Connectors", "Clerk pop-up (OAuth)", "Yes"],
    ["Claude Code", "/plugin marketplace add, or claude mcp add", "/mcp → Clerk", "Yes"],
    ["ChatGPT", "Settings › Apps › Developer mode → create", "Clerk pop-up (OAuth)", "No — direct only"],
    ["Codex", "codex plugin marketplace add, or codex mcp add", "codex mcp login", "Yes"],
    ["Cursor", "Settings › Tools & MCP → add server", "Clerk pop-up (OAuth)", "No — direct only"],
  ]
));
children.push(spacer());
if (can("editor")) {
  children.push(callout("Read vs. write across tools", ["Claude, Claude Code, Codex, and Cursor support both reading and writing. ChatGPT reaches custom MCP connectors through Developer Mode, which OpenAI gates by plan: which plans can add custom MCP connectors, and whether they are read-only or can also write, is set by OpenAI and has changed over time. Check OpenAI's current guidance (see the ChatGPT section) before relying on it; to save content back, the other four clients are the reliable path."], "FFF6E6", "E0A300"));
}

children.push(H2("Claude (web, desktop, Cowork, mobile)"));
children.push(P([t("Recommended: use the plugin install above — it sets up the skills and this connection together. The steps below connect MaC as a plain MCP connector only (no bundled skills); use them if you want that instead, or if the plugin path above doesn't work for you.")]));
[ "Open Claude and go to Settings. (On the web, click your profile, then Settings; in the desktop app, the same Settings menu.)",
  "Select Connectors in the sidebar.",
  "Scroll down and click Add custom connector." ].forEach((s) => children.push(numbered(s)));
children.push(numbered([t("Give it a name — for example "), b("MaC"), t(" — and paste the server URL:")]));
children.push(code(URL));
children.push(numbered(`Click Add. A sign-in window appears — authenticate with Clerk using ${cfg.user_email} and approve access.`));
children.push(numbered([t("To use it in a chat, click the "), b("+"), t(" button near the message box, choose Connectors, and switch MaC on for that conversation.")]));
children.push(callout("Note", ["Connecting works the same on the Claude desktop app, Cowork, and the mobile apps, because the connection is brokered through your Claude account rather than your device."]));

children.push(H2("Claude Code"));
children.push(P([t("Recommended: use the plugin install above ("), t("/plugin marketplace add", { font: "Consolas", size: 18, color: BLUE }), t(") — it's one command and sets up the skills too. The steps below add MaC as a plain MCP connector only.")]));
children.push(P("Claude Code is a terminal tool. Add MaC with a single command:"));
children.push(code("claude mcp add --transport http mac " + URL));
children.push(P([t("Then, inside Claude Code, run "), b("/mcp"), t(" and choose to authenticate. Your browser opens for the Clerk sign-in. After that, the tools are available in every session.")]));
children.push(P([t("To confirm it worked, run "), b("claude mcp list"), t(" — you should see "), t("mac", { font: "Consolas", size: 19, color: BLUE }), t(" listed as connected.")]));
children.push(callout("Tip — make it available everywhere", [[t("Add "), t("--scope user", { font: "Consolas", size: 18, color: BLUE }), t(" to the end of the command to make MaC available across all your projects, not just the current folder.")]]));

children.push(H2("ChatGPT"));
children.push(P("ChatGPT calls custom MCP connections “apps,” and they live behind Developer Mode. Use ChatGPT on the web (this isn’t available in the mobile app)."));
children.push(numbered("Click your profile, then Settings."));
children.push(numbered([t("Open "), b("Apps"), t(" (you may see it as “Connectors”), then "), b("Advanced settings"), t(", and turn on "), b("Developer mode"), t(".")]));
children.push(numbered([t("Back in the Apps panel, click "), b("Create"), t(" (or “Add custom connector”).")]));
children.push(numbered("Enter a name (“MaC”), a short description, and the server URL:"));
children.push(code(URL));
children.push(numbered(`Create it, then complete the Clerk sign-in pop-up with ${cfg.user_email}. If the connection succeeds, ChatGPT shows the list of MaC tools.`));
children.push(numbered("In a chat, enable MaC from the Developer Mode / tools menu. When ChatGPT wants to use a MaC tool, it will ask you to approve the action."));
children.push(callout("Plan note", ["Custom MCP connectors in ChatGPT live behind Developer Mode and require a paid plan. OpenAI controls which plans can create custom MCP connectors and whether they are read-only or can also write, and this has changed over time, so confirm against OpenAI's current guidance before relying on it: https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt . If your plan can't add custom MCP connectors (or only read-only) and you need to save content back, use Claude, Claude Code, Codex, or Cursor instead."], "FFF6E6", "E0A300"));

children.push(H2("Codex (command line)"));
children.push(P([t("Recommended: use the plugin install above ("), t("codex plugin marketplace add", { font: "Consolas", size: 18, color: BLUE }), t(") — it sets up the skills too. The steps below add MaC as a plain MCP connector only.")]));
children.push(P("OpenAI’s Codex CLI stores its settings in a config file, but you can add MaC with one command:"));
children.push(code("codex mcp add mac --url " + URL));
children.push(P("Then sign in:"));
children.push(code("codex mcp login mac"));
children.push(P("Your browser opens for the Clerk sign-in. Once complete, start a Codex session and the tools are available; run /mcp inside a session to confirm MaC is connected."));

children.push(H2("Cursor"));
children.push(P("Cursor is an AI code editor that connects to MaC through its settings or a small config file."));
children.push(P([b("The easy way: "), t("open Cursor Settings, go to "), b("Tools & MCP"), t(", click "), b("Add new MCP server"), t(", choose the remote / HTTP option, name it “MaC” and paste the URL:")]));
children.push(code(URL));
children.push(P([b("Or by file: "), t("create "), t("~/.cursor/mcp.json", { font: "Consolas", size: 19, color: BLUE }), t(" (for all projects) containing:")]));
children.push(code('{ "mcpServers": { "mac": { "url": "' + URL + '" } } }'));
children.push(P("Restart Cursor. A browser window opens for the Clerk sign-in. Then open Cursor’s chat (Agent mode) and ask “what tools do you have?” to confirm the MaC tools are listed."));

children.push(H2("Any other MCP client"));
children.push(P([t("MaC follows the open MCP standard, so any client that supports remote MCP servers can connect. Wherever it asks for a server, choose the HTTP / remote option, paste the URL "), t(URL, { font: "Consolas", size: 18, color: BLUE }), t(", and complete the Clerk sign-in.")]));

children.push(H2("Confirm you’re connected"));
children.push(P("Whatever client you used, run this quick check. In a new chat, ask:"));
children.push(code("Using MaC, who am I and what can I access?"));
children.push(P([t("The assistant should report that you are "), b(cfg.user_name), t(" with "), b(ROLE_LABEL[primary.role] + " access"), t(" to "), t(primary.slug, { font: "Consolas", size: 19, color: BLUE }), t(multi ? " (and your other companies)." : "."), t(" For a fuller picture, ask it to “get my MaC workspace manifest.”")]));

// GETTING STARTED — moved here (after Connecting) since this topic assumes
// the reader is already connected ("You're connected — nice"); it made no
// sense as the very first section before Section 4 explains how to connect.
children.push(new Paragraph({ children: [new PageBreak()] }));
renderTopic("getting-started");

// 5 TOOLBOX — live tool_catalog + skills (BEA-171: no more hardcoded tables).
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(S1("The MaC Toolbox"));
const usingTools = (guideContent.prose_sections || []).find((s) => s.id === "using-tools");
if (usingTools) {
  children.push(...renderMarkdown(usingTools.markdown));
} else {
  children.push(P("This is the set of capabilities MaC gives your AI assistant at your access level. You don’t type these tool names — you just ask naturally, and the assistant picks the right one."));
}

if (!isLive) {
  children.push(callout(
    "This guide may be out of date",
    [`Tool and skill listings below come from a bundled snapshot (captured ${guideContent.snapshot_captured_at || "unknown date"}, help_version ${guideContent.help_version || "unknown"}) because the live MaC connector wasn’t available when this guide was built. For the current list, once connected, ask your assistant "what can I do with MaC?"`],
    "FFF6E6", "E0A300"
  ));
  children.push(spacer());
}

// Live results are already scoped by the server via audience_role; a
// snapshot has no role context, so filter it here the same way the server
// would (reusing this script's own can()/isAdmin — same rank ordering).
const visibleTools = isLive
  ? (guideContent.tool_catalog || [])
  : (guideContent.tool_catalog || []).filter((r) => (r.min_role === "platform_admin" ? isAdmin : can(r.min_role)));

let letterIdx = 0;
const nextLetter = () => String.fromCharCode(65 + letterIdx++);
const byCategory = new Map();
visibleTools.forEach((r) => {
  if (!byCategory.has(r.category)) byCategory.set(r.category, []);
  byCategory.get(r.category).push(r);
});
for (const [category, rows] of byCategory) {
  children.push(H2(`${nextLetter()}. ${category}`));
  children.push(toolTable(rows.map((r) => [r.tool, r.summary, r.example_ask])));
}

if (guideContent.skills && guideContent.skills.length) {
  children.push(H2(`${nextLetter()}. Available skills`));
  children.push(P("Governed AI skill packages you can ask your assistant to run for you."));
  children.push(refTable(["Skill", "What it does"], [3000, 6360], guideContent.skills.map((s) => [s.display_name, s.summary])));
  if (guideContent.skills_note) {
    children.push(spacer());
    children.push(P(guideContent.skills_note, { italics: true, color: GREY, size: 18 }));
  }
}

if (isAdmin) {
  // Kept static and hand-authored (unchanged from before BEA-171): the live
  // audience_role can never preview platform-admin-only tools for anyone but
  // the real, currently-authenticated platform admin, so this can't be
  // sourced from the live catalog for a recipient who isn't the caller.
  children.push(H2(`${nextLetter()}. Administration (Platform Admin)`));
  children.push(P("As a platform administrator you also have provisioning tools: creating companies, granting and revoking user roles, promoting or removing administrators, and issuing or revoking access keys. Use these with care — they affect who can access what across the platform."));
}

// 6+ remaining live topics, in the order the server returns them.
children.push(new Paragraph({ children: [new PageBreak()] }));
renderTopic("workflows");
renderTopic("troubleshooting");
renderTopic("glossary");

// closing
children.push(spacer());
children.push(P([b("Your server address (keep this handy): ")]));
children.push(code(URL));
children.push(spacer());
children.push(P([t("Welcome aboard. Once MaC is connected, your brand travels with you into every tool you write and create content in — consistent, accurate, and always up to date.", { italics: true, color: GREY })]));

// Populate the Contents placeholder now that every section title is known.
// Plain styled text, not a live field or hyperlink — see the note by
// tocEntries above for why.
const tocParagraphs = tocEntries.map((entry) => new Paragraph({
  spacing: { after: 120, line: 268 },
  children: [new TextRun({ text: `${entry.num}. ${entry.title}`, color: BLUE, size: 24 })],
}));
children.splice(tocPlaceholderIndex, 1, ...tocParagraphs);

// prevent adjacent tables merging
const spaced = [];
for (let i = 0; i < children.length; i++) {
  spaced.push(children[i]);
  if (children[i] instanceof Table && i + 1 < children.length && children[i + 1] instanceof Table) {
    spaced.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun("")] }));
  }
}

const doc = new Document({
  features: { updateFields: true },
  creator: "Marketing as Code",
  title: "Marketing as Code — Getting Started Guide",
  description: "Personalized Getting Started Guide for " + cfg.user_name,
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: "222B33" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, font: "Arial", color: "33424F" }, paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 280 } } } },
      ] },
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } },
      ] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D5DBDE", space: 4 } },
      children: [new TextRun({ text: "Marketing as Code", size: 16, color: GREY, bold: true }), new TextRun({ text: "\tGetting Started Guide", size: 16, color: GREY })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      tabStops: [{ type: TabStopType.CENTER, position: 4680 }, { type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D5DBDE", space: 4 } },
      children: [new TextRun({ text: CONF, size: 15, color: GREY }), new TextRun({ text: "\t", size: 15 }), new TextRun({ children: ["Page ", PageNumber.CURRENT], size: 15, color: GREY })],
    })] }) },
    children: spaced,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log(
    "Wrote " + outPath + " (" + buffer.length + " bytes) for " + cfg.user_name +
    " — roles: " + cfg.companies.map((c) => c.slug + ":" + c.role).join(", ") +
    " — guide_content: " + guideContent.source + " (help_version " + guideContent.help_version + ")"
  );
});
