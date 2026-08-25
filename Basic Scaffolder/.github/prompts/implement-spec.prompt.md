---
agent: agent
model: Claude Sonnet 5
description: 'Implements the AL objects defined in an approved technical spec — tables, pages, and permission set entries.'
tools: [read, edit/editFiles, search, 'al-symbols-mcp/*']
---

# AL Implementation Workflow

Your goal is to implement, in real AL code, exactly what
`${input:req_name}.spec.md` already decided. This phase does not design —
it builds what was already approved.

## Guardrails

- **Never write any `.al` file until Step 4 (STOP) has passed with
  explicit approval.**
- **Requires an approved technical spec.** If
  `.github/plans/${input:req_name}/${input:req_name}.spec.md` does not
  exist, or its `Status` is not `Approved`, STOP immediately and tell the
  user to run `/create-spec` (and get it approved) first.
- **Do not redesign.** If something in the spec looks wrong, incomplete,
  or in conflict with the current codebase, do NOT silently fix it or
  improvise around it — flag it explicitly in the Step 4 summary and let
  the human decide. This prompt implements decisions, it doesn't make new
  ones.
- No IDs outside the `idRanges` declared in `app.json`. The spec already
  resolved this, but re-verify at implementation time in case `app.json`
  changed since the spec was approved.
- Prefix: RFL. Follow the conventions in `skill-tables` / `skill-relations`
  / `skill-permissions` exactly as the spec already applied them — this
  prompt does not reinterpret those skills, the spec already did.

## Step 1 — Read context

1. Read `.github/plans/${input:req_name}/${input:req_name}.spec.md`
   (required — must be `Status: Approved`, see Guardrails).
2. Read `.github/plans/${input:req_name}/${input:req_name}.functional-spec.md`
   for the business-rule wording needed inside validation logic and
   captions (the technical spec has the structure, the functional spec
   has the "why").
3. Read `app.json` to re-confirm the ID range is still valid.
4. Search `/src` for the exact current syntax of any object referenced
   in §2 "Object Inventory" (e.g. `RFL Equipment`) via `al-symbols-mcp`,
   so relations and field references compile against reality, not memory.

## Step 2 — Decide skills

Reload the same skills the spec's §2/§4/§5 already used, so the
implementation follows the same conventions the spec was built on:

- Object Inventory includes a new table  -> `skill-tables`
- §4 Relations is non-empty              -> `skill-relations`
- §5 Permission Set Changes is non-empty -> `skill-permissions`

## Step 3 — Generate

For every row in the spec's Object Inventory (§2), generate the full
`.al` file content:

- Tables/pages: fields, keys, and captions exactly as listed in §3 Data
  Model — do not add or remove fields the spec didn't list.
- Relations: `TableRelation` exactly as described in §4.
- Permission set: add the entries from §5 to the app's existing
  `RFLPermissionSet.PermissionSet.al` — do not create a new permission
  set file.

Show every generated file in full in the chat. Do not write anything to
disk yet.

## Step 4 — 🛑 STOP

Show:
- The list of files that will be created or modified, with their paths.
- Anything flagged as a spec inconsistency (per Guardrails) that needs a
  human decision before continuing.

Ask explicitly: "¿Aplico estos cambios?"

Only an unambiguous confirmation counts as approval ("sí", "aprobado",
"adelante", "aplica"). Ambiguous replies ("vale", "bien", "interesante")
do NOT count — ask again explicitly before continuing.

## Step 5 — Apply

Only after explicit approval:
1. Write each `.al` file to `/src/Equipment/` (or the relevant subfolder).
2. Update `RFLPermissionSet.PermissionSet.al` with the new entries.
3. Update the `Status` field in `${input:req_name}.spec.md` from `Draft`
   (or `Approved`) to `Implemented`.
4. Suggest running the AL compiler to confirm everything builds.
