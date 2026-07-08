# Config schema & input gathering

The builder script (`scripts/build_guide.js`) is driven by a single JSON config.
Assemble it from what the skill user provides, then write it to a temp path and
pass it to the script.

## Schema

```json
{
  "user_name": "Debasree Panda",            // REQUIRED
  "user_email": "debasree@imesh.ai",        // REQUIRED — the exact Clerk sign-in email
  "user_title": "Chief Executive Officer",  // optional — shown on the cover
  "companies": [                            // REQUIRED — one or more
    { "slug": "imesh", "display_name": "iMesh", "role": "owner" }
  ],
  "server_url": "https://mcp-server-production-131d.up.railway.app/mcp", // optional, sensible default
  "date_label": "June 2026",                // optional — defaults to current month + year
  "edition": "1.0",                         // optional
  "confidential_label": "Confidential — internal use", // optional
  "guide_content": { ... }                  // optional (BEA-171) — see below
}
```

### Field rules
- **role** must be one of `viewer | editor | owner | admin` (admin = platform admin). Case-sensitive.
- **display_name** defaults to `slug` if omitted, but prefer the real display name.
- **companies** may contain several entries with different roles. The guide's tool
  sections are gated by the user's **highest** role across all companies; the access
  table always lists every company and its individual role.

## `guide_content` — live prose, tools, and skills (BEA-171)

The script no longer hardcodes the guide's prose or tool/skill listings — it
renders them from the server's structured content bundle instead, so a new
server tool (with its catalog entry) or a newly published skill shows up here
automatically, with no edit to this skill.

**Fetch it yourself, before building** (you already have an authenticated MCP
session and call `whoami`/`list_company_users` directly per the cross-check
below — this is the same pattern):

```
get_user_guide(format="structured", audience_role="<recipient's role>")
```

Then embed the raw result under `guide_content` in the config, adding
`source: "live"` and a `fetched_at` timestamp:

```json
"guide_content": {
  "source": "live",
  "fetched_at": "2026-07-07T12:00:00Z",
  "help_version": "1.0.0",
  "prose_sections": [ ... ],
  "tool_catalog": [ ... ],
  "skills": [ ... ]
}
```

**`audience_role` — use the recipient's highest role, with one exception.**
Pass `viewer`, `editor`, or `owner` directly — whichever matches the
recipient's highest `companies[].role`. **If the recipient's role is `admin`
(platform admin), pass `audience_role="owner"` instead of `"admin"`.** The
server's `audience_role` is a *preview* of another company-role audience; it
can never reveal platform-admin-only tools for anyone but the real,
currently-authenticated platform admin (that's a deliberate, permanent
constraint of `get_user_guide`, not a bug to work around). So for a
platform-admin recipient, fetch at the `owner` tier — the highest the live
catalog can represent for someone else — and the script's own static
"Administration" note (unchanged from before this change) covers the rest.

**If the MCP connector isn't available**, just omit `guide_content` entirely.
The script falls back to the bundled offline snapshot
(`references/guide-content.snapshot.json`) automatically, marks the guide with
a visible staleness warning (showing the snapshot's `help_version` and capture
date), and still builds successfully — never block the build on this.

Mention which path was used (live or the bundled snapshot) in your review
summary to the skill user (step 3) before they approve sending.

## Gathering inputs

If the skill user hasn't supplied everything, ask for the missing pieces in one
short prompt: full name, email, and for each company the slug/display name and role.

**Optional cross-check (recommended when the MaC MCP connector is available):**
verify the supplied companies/roles against the server before building, so the
guide can't claim access the user doesn't actually have:
- `list_company_users(company_slug)` — confirm the user's role on a company.
- `whoami` / `list_my_companies` — if generating for yourself.
If the live data disagrees with what was supplied, surface the discrepancy to the
skill user and ask which to trust before building. Never silently override.
