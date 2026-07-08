---
name: mac-guide-creator
version: 1.0.0
description: >-
  Create and deliver a personalized Marketing as Code (MaC) Getting Started Guide for a
  specific MaC user, then email it to them. Use this skill whenever someone wants to
  onboard a MaC user, generate or send a "getting started" / "user guide" / "welcome"
  document for MaC, produce a connection guide for the MaC MCP server, or email a MaC
  guide to a new user. Trigger on phrases like "create a MaC guide", "onboard a user to
  MaC", "send the getting started guide", "make a welcome guide for our new MaC user",
  or whenever a MaC user's name, email, and company/role access are provided with intent
  to give them setup instructions. The skill assembles a role-aware .docx (and PDF),
  shows it for review, and — only after approval — emails it via the Gmail connector by
  default, or another email connector the skill user authorizes.
---

# MaC Guide Creator

Produce a personalized, role-aware MaC Getting Started Guide for one user and deliver it
by email. The guide is the same polished document used for MaC onboarding, customized to
the recipient's name, sign-in email, companies, and RBAC role on each — so it shows only
the tools and capabilities that person actually has.

The script does the document assembly. Your job is to gather the inputs, run the build,
get the skill user's review and explicit approval, and then send the email.

## Workflow

Follow these steps in order. Do not send anything before the human approval step.

### 1. Gather the inputs

You need: the recipient's **full name**, **sign-in email**, and **one or more companies**
each with a **slug/display name** and **RBAC role** (`viewer | editor | owner | admin`).
Optional: the recipient's title, and a sender name for the email.

- If the conversation already contains these, use them.
- If anything is missing, ask for it in one short prompt — don't interrogate.
- Read `references/config-schema.md` for the exact field rules and the role→content mapping.

**Optional but recommended cross-check:** if the MaC MCP connector is available, verify the
supplied companies/roles against the server (`list_company_users`, or `whoami` /
`list_my_companies` when generating for yourself) so the guide can't claim access the user
doesn't have. If live data disagrees with what was supplied, surface it and ask which to
trust. Never silently override the skill user.

**Fetch the guide content, live, while the connector is available.** Call
`get_user_guide(format="structured", audience_role="<recipient's highest role>")` yourself —
this is the same "call an MCP tool directly" pattern as the cross-check above. Use
`viewer`/`editor`/`owner` matching the recipient's highest company role; if their role is
`admin` (platform admin), pass `audience_role="owner"` instead (the live catalog can never
preview platform-admin-only tools for anyone but the real, currently-authenticated admin —
see `references/config-schema.md`). Embed the raw JSON result under `guide_content` in the
config (add `source: "live"` and a `fetched_at` timestamp). **If the connector isn't
available, just skip this** — the script falls back to its bundled offline snapshot on its
own and marks the guide with a staleness warning; don't block on it.

### 2. Build the guide

Write the assembled config (including `guide_content` if you fetched it) to a temp JSON
file and run the builder:

```bash
cd <skill-dir>
node scripts/build_guide.js /tmp/mac_guide_config.json /tmp/MaC-Getting-Started-Guide.docx
```

The script renders the prose, tool catalog, and skills list from `guide_content` (or its
own bundled snapshot if you didn't supply one — watch stderr for a fallback warning) and
gates the toolbox by the user's highest role. It requires the `docx` npm package
(`npm install -g docx` if not present) and Node.js.

Then **validate** the file and, if a PDF converter (LibreOffice) is available, also
produce a PDF for a clean, printable attachment:

```bash
python /mnt/skills/public/docx/scripts/office/validate.py /tmp/MaC-Getting-Started-Guide.docx
python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf /tmp/MaC-Getting-Started-Guide.docx
```

If LibreOffice isn't available, proceed with the `.docx` alone — don't block on the PDF.

### 3. Review and approve (required human gate)

Save the file(s) to the outputs directory and present them to the skill user with a short
summary: recipient, email, companies + roles, which toolbox sections were included, and
whether the tool/skill listings came from the **live** connector or the **bundled
snapshot** (the builder prints which one to stdout) — if it's the snapshot, say so plainly
so the skill user knows the guide may be stale before they approve sending it.
Show the drafted email too (recipient, subject, body — see step 4).

Then ask for explicit approval to send, e.g. *"Want me to send this to <email>, or adjust
anything first?"* **Do not send until the skill user clearly approves.** If they want
changes, edit the config (or email text) and rebuild.

### 4. Compose the email

Use `references/email-templates.md` for the subject and body. Personalize the placeholders
from the config. Keep it warm, concrete, and under ~180 words. Always include the
"sign in with this exact email" instruction — it prevents the most common onboarding
failure (an empty workspace from a mismatched sign-in). Attach the **PDF** if one was
produced (cleaner for the recipient); otherwise attach the `.docx`. You may attach both.

### 5. Send via a connector (only after approval)

**Default: the Gmail connector.** Look for an available Gmail tool and use it to deliver
the email with the guide attached.

- If a Gmail **send** tool is available, send directly to the recipient with the attachment.
- If only a Gmail **draft** tool is available (or the connector can't attach binaries),
  create the draft with the subject and body, tell the skill user the attachment file is
  saved at its output path, and instruct them to attach it and hit send. This still
  satisfies "deliver via Gmail" without you performing an unconfirmed send.

**If Gmail is not connected:** do not silently pick another service. Tell the skill user
Gmail isn't available and ask them to either (a) authorize a specific alternative email
connector to use instead, or (b) have you produce the final files plus a copy-paste subject
and body for manual sending. Only use an alternative connector the skill user explicitly
names.

After sending (or drafting), confirm what happened: the recipient, the connector used,
and whether it was sent or left as a draft for them to send.

## Guardrails

- **Never send without explicit approval.** Sending email on someone's behalf is a
  confirmed action; the review gate in step 3 is mandatory.
- **Only use the connector the skill user authorized.** Gmail is the default; any
  alternative must be named by the skill user, not chosen by you.
- **Don't invent access.** Build strictly from the supplied (or server-verified) roles.
  If you can't confirm a role, ask rather than guess.
- **Exact email matters.** The recipient must register in Clerk with the same address the
  guide is built for, or their workspace will appear empty. Keep that instruction intact.
- **Personalize only from provided data.** Don't add claims about the recipient's plan,
  company, or seniority beyond what the config contains.

## Files

- `scripts/build_guide.js` — the parameterized, role-aware document builder. Driven by a JSON config; renders prose, tool catalog, and skills from `guide_content` (live or the bundled snapshot); outputs a validated `.docx`.
- `references/config-schema.md` — config fields, the `guide_content`/`audience_role` contract, and input-gathering guidance. Read before building.
- `references/guide-content.snapshot.json` — bundled offline fallback for `guide_content`, used automatically when no live connector is available. Refresh it periodically (regenerate from a live `get_user_guide(format="structured", audience_role="owner")` call) so the fallback doesn't drift too far from reality; it always renders with a visible staleness warning regardless.
- `references/email-templates.md` — subject/body templates and placeholder reference. Read before composing the email.
