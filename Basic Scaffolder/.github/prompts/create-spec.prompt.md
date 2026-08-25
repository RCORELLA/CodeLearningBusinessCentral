---
agent: agent
model: Claude Sonnet 5
description: 'Generates a technical AL specification from an approved functional spec — object inventory, data model, and permission changes.'
tools: [read, edit/editFiles, search, 'al-symbols-mcp/*']
---

# AL Technical Specification Workflow

Your goal is to turn the approved functional specification for `${input:req_name}`
into a **technical specification**: exact objects, fields, and permission
changes — the blueprint the implementation prompt will build from.

This is **NOT** the functional phase. Business rules are already settled;
this phase decides objects, fields, keys, and access — not whether the
feature is needed or what it should do.

## Guardrails

- **Never create or modify real AL objects** in this phase — this produces
  a document only, nothing gets written to `/src`.
- **Requires the functional spec.** If
  `.github/plans/${input:req_name}/${input:req_name}.functional-spec.md`
  does not exist, STOP immediately and tell the user to run
  `/create-functional-spec` first — do not guess scope from a raw
  description instead.
- **The functional spec must have no open questions left.** If section 3
  of the functional spec still lists unresolved questions, STOP and ask
  whether those have been answered elsewhere before continuing.
- No IDs hardcoded anywhere in this prompt: resolve every ID against the
  `idRanges` declared in `app.json` (Step 1).
- Prefix: RFL.

## Step 1 — Read context

1. Read `.github/plans/${input:req_name}/${input:req_name}.functional-spec.md`
   (required — see Guardrails).
2. Read `app.json` for `idRanges` and current object IDs already in use.
3. Search `/src` for existing RFL objects this feature will touch or
   relate to (e.g. `RFL Equipment`, `RFL Maintenance Log`).

## Step 2 — Decide skills

- A new table is needed          -> load `skill-tables`
- It relates to an existing table -> load `skill-relations`
- Any object is created or changed -> load `skill-permissions`

Load only what applies — do not load a skill for a domain this spec
doesn't touch.

## Step 3 — Generate the specification

Create `.github/plans/${input:req_name}/${input:req_name}.spec.md`:

```markdown
# ${input:req_name} — Technical Specification

**Status:** Draft — pending review
**Based on:** ${input:req_name}.functional-spec.md

## 1. Overview
[1-2 sentences restating the approved functional scope in technical terms]

## 2. Object Inventory

| Object Type | Object ID | Name | Relates to | Purpose |
|---|---|---|---|---|
| Table | {ID from idRanges} | "RFL {Name}" | {existing table, if any} | {why} |
| Page  | {ID} | "RFL {Name}" | — | {list/card} |

## 3. Data Model

For each new/changed table, the field list with type, caption, and
DataClassification (per skill-tables), and the key structure.

## 4. Relations

Any TableRelation this feature introduces, and to what (per skill-relations).
Omit this section entirely if there are none.

## 5. Permission Set Changes

| Object | Access level |
|---|---|
| tabledata "RFL {Name}" | RIMD |
| page "RFL {Name}" | X |

## 6. Open Questions (technical only)
[Things that need a technical decision, not a business one — e.g. an
ambiguous ID range conflict. If none: "None."]
```

Show the full document in the chat. Do not write it to disk yet.

## Step 4 — 🛑 STOP

Show the summary: objects proposed, IDs used, permission changes.
Ask explicitly: "¿Apruebas esta especificación técnica?"

Only an unambiguous confirmation counts as approval ("sí", "aprobado",
"adelante"). Ambiguous replies ("vale", "bien", "interesante") do NOT
count — ask again explicitly before continuing.

## Step 5 — Apply

Only after explicit approval: write the file to disk, and tell the user
the next step is running the implementation prompt for this feature.
