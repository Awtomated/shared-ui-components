# @awtomated/shared-ui

Framework-agnostic UI components shared between the Awtomated host app (`main-app`) and its micro-frontends. Components here render UI and emit callbacks only — no API calls, no routing, no auth.

## Install (git dependency)

```json
"@awtomated/shared-ui": "git+https://<host>/<org>/shared-ui.git#v0.1.0"
```

`npm`/`yarn` run this package's own `prepare` script (`npm run build`) right after cloning, so no build artifacts need to be committed to the repo.

## Local development (before pushing to a remote)

From a sibling checkout (e.g. `main-app` next to `shared-ui`):

```json
"@awtomated/shared-ui": "file:../shared-ui"
```

Then `npm run build` (or `yarn build`) inside `shared-ui/` whenever you change its source, and reinstall in the consumer to pick up the new `dist/`.

## Components

- `FilterBar`, `FilterChip`, `FilterDropdown` — config-driven filter chip row (Stripe-style: shows a selected count and a dismiss `x` per active filter).
- `MentionCommandEditor` — rich-text field with "@" mention and "/" module→entity command support (Tiptap-based). Renders UI and emits `onChange` only; it has no built-in notion of who "@" resolves to or what modules/entities "/" links against — wire those in via props:
  - `searchMentions(query) => groups[]` — powers "@" (each group is `{ entityType, label, items: [{ id, label, email? }] }`)
  - `searchModules(query) => [{ moduleKey, label, icon }]` — powers the first "/" (module picker)
  - `getEntityProvider(moduleKey) => { isEmpty, load(query) }` — powers the second "/" (entity picker scoped to the chosen module)
  - `accentColor` — hex/css color for mention & chip text (Tiptap's `renderHTML` runs outside React and can't read a theme hook, so this can't come from `useTheme()`)

  Any of these can be omitted if a host app only needs a subset (e.g. just "@" mentions) — the missing trigger renders empty results instead of erroring. Also exports `EMPTY_DESCRIPTION_VALUE`, `extractMentions`, `extractModuleEntityPairs`, `docJSONToStructured` for turning the editor's structured `{ content, plainText }` value into an API payload.

See `main-app/src/app/main/Timesheet/components/LogTimePopover.js` for a live example of both.
