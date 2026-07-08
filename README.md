# Marketing as Code — Plugin Distribution

This repository is the **public distribution mirror** for the Marketing as Code (MaC)
Claude Code and Codex plugins. It contains only the already-assembled, self-contained
plugin bundles (skill instructions plus a pointer to the hosted MaC MCP server) —
no source code, no accounting data, no internal configuration, no company registry,
and no other internal MaC material.

The canonical, editable source for these plugins lives in the **private**
`beauzone/marketing-as-code` repository, under `extensions/plugins/{claude,codex}`.
This repo is a **published copy**, restructured at the root as `/claude` and `/codex`.

> **Note on sync:** This mirror is currently kept in sync **manually** by a maintainer
> running `build_plugins.py` in the private repo and re-pushing the assembled output
> here. There is no automated sync pipeline yet — that is a known follow-up. If you
> notice this repo looks stale relative to the private source, ping a maintainer.

## What's inside

```
.
├── .claude-plugin/marketplace.json   # Claude Code marketplace manifest
├── .agents/plugins/marketplace.json  # Codex marketplace manifest
├── claude/                           # Claude Code plugin bundle
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json                     # points at the hosted mac-server MCP endpoint
│   └── skills/                       # mac-gtm-strategist, mac-content-creator,
│                                      # mac-company-manager, mac-copy-reviewer,
│                                      # mac-guide-creator
└── codex/                            # Codex plugin bundle (same 5 skills)
    ├── .codex-plugin/plugin.json
    ├── .mcp.json
    └── skills/
```

Both bundles are auth-gated at first use: the `mac-server` MCP tools become available
after you complete the Clerk OAuth handshake for the Marketing as Code MCP server.

---

## Install — Claude Code

### Method 1: Marketplace via CLI

```
/plugin marketplace add beauzone/marketing-as-code-plugin
/plugin install marketing-as-code@marketing-as-code
```

Start a new session afterward. The five skills load namespaced (e.g.
`marketing-as-code:mac-gtm-strategist`).

### Method 2: Marketplace via GUI (Claude Desktop / Web / Cowork — no terminal needed)

1. Open the **Customize** menu → **Plugins** tab.
2. Click **+** → **Add marketplace** → **Add from a repository**.
3. Enter `beauzone/marketing-as-code-plugin` (or the full URL,
   `https://github.com/beauzone/marketing-as-code-plugin`) → **Done**.
4. Go to **Browse plugins**, find **marketing-as-code**, and click **Install**.

This requires no GitHub access grant beyond fetching a public repo.

### Method 3: Upload a plugin file (no GitHub account or access needed at all)

1. Go to this repo's [Releases page](https://github.com/beauzone/marketing-as-code-plugin/releases)
   and download the latest `.zip` asset.
2. In Claude: **Customize** menu → **Plugins** tab → upload the file directly.

This is the simplest path for anyone who just wants the plugin installed locally
without adding a marketplace or touching GitHub at all.

---

## Install — Codex

### Method 1: Marketplace via CLI

```
codex plugin marketplace add beauzone/marketing-as-code-plugin
codex plugin add marketing-as-code@marketing-as-code
```

### Method 2: Marketplace via GUI

Point Codex's plugin/marketplace settings at this repository
(`beauzone/marketing-as-code-plugin`) the same way you would for Claude Code above;
Codex resolves `.agents/plugins/marketplace.json` and the `./codex` plugin source
automatically.

### Method 3: Local / offline

Download the repo (or the release zip) and point Codex at the `codex/` directory
directly, the same way you would with a local plugin checkout.

---

## Questions or drift

If a skill here looks out of date compared to what you'd expect, or you want to
contribute a change, changes must be made in the private `beauzone/marketing-as-code`
repo under `extensions/plugins/shared/skills/`, then rebuilt with `build_plugins.py`
and re-published here by a maintainer. This repo itself should be treated as
read-only / generated output.
