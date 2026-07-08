# Email templates

The skill personalizes and sends a short, warm cover email with the guide attached.
Fill the `{{placeholders}}` from the config. Keep the tone welcoming and concise.

---

## Default template (new user, first connection)

**Subject:**
```
Welcome to Marketing as Code — your Getting Started guide
```

**Body (plain text / light markdown):**
```
Hi {{first_name}},

Welcome to Marketing as Code (MaC). MaC connects {{company_phrase}}'s brand and
marketing intelligence to the AI tools you already use — so anything you write
stays on-brand, accurate, and grounded in your real positioning and proof.

I've attached a short Getting Started guide tailored to you. It covers:

  • what MaC is and how it works, in plain language
  • how to connect it to your AI client (Claude, ChatGPT, Cursor, and more)
  • the exact things you can ask it to do at your access level

Two quick notes before you start:

  1. Sign in with this exact email — {{user_email}} — when you first connect.
     Your access is tied to that address.
  2. You only need to set up one AI client to begin; you can add others later.

If anything doesn't behave as expected, the guide's troubleshooting section
covers the common cases, and you can reply here any time.

Welcome aboard,
{{sender_name}}
```

---

## Placeholder reference

| Placeholder | Source | Example |
|---|---|---|
| `{{first_name}}` | first token of `user_name` | "Debasree" |
| `{{user_email}}` | `user_email` | "debasree@imesh.ai" |
| `{{company_phrase}}` | single company → its `display_name`; multiple → "your companies" | "iMesh" |
| `{{sender_name}}` | provided by the skill user at send time; default "The Marketing as Code team" | "Beau" |

## Tone rules
- Warm, brief, and concrete. No hype, no jargon.
- Never invent details about the recipient's plan, company, or role beyond what the config provides.
- The exact-email instruction (point 1) is mandatory — it prevents the most common onboarding failure (empty workspace from a mismatched sign-in).
- Keep the body under ~180 words.
