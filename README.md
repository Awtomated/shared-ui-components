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

- `DriveAttachment` — Attachments field with Upload / Drive tabs and a persistent "Selected files" list. Headless: it renders caller-supplied `uploadRecords` and reports picks via `onFilesAdded` / `onDriveFilesSelected`; the Drive browser itself is caller-supplied via `renderDrive({ multiSelect, onFilesSelected, selectedIds })`, so this package never depends on drive-mf. The Drive slot has its own Suspense + error boundary: a Drive load failure shows an inline "Drive unavailable" state (Retry → `onDriveRetry`) while Upload, the selected-files list and the parent form keep working. See `main-app/src/app/shared-components/DocumentUpload/DocumentUploader.jsx`.

  Custom / overridden tabs: `tabs` (list of ids) decides which tabs show and their order; the optional `tabConfigInfo` map overrides the built-in config per id (shallow, caller wins). If an entry has a `component`, it replaces that tab's content (also for the built-in `upload` / `drive`); otherwise the built-in content renders. An id with neither built-in content nor a `component` is skipped.

  ```jsx
  <DriveAttachment
    tabs={["upload", "project", "drive", "compose"]}
    tabConfigInfo={{
      drive: { label: "My Drive" },                                  // label only, built-in content
      project: { label: "Project", icon: <FolderIcon />, component: ProjectFilesTab },
      compose: { component: ComposeTab, props: { draftId } },        // label falls back to "Compose"
    }}
    {...existingProps}
  />
  ```

  Entry keys: `label`, `icon`, `component`, `props`, `disabled`, `fixedHeight` (use the `height` prop while active; Drive defaults to `true`), `contentSx`, `errorMessage`, `onRetry`, `onError`. `component` receives `{ uploadRecords, onFilesAdded, onRemoveRecord, onRetryRecord, acceptExtensions, dropzoneHint, driveMultiSelect, onDriveFilesSelected, driveSelectedIds, activeTab, setActiveTab }` with `props` spread on top, and is wrapped in its own Suspense + error boundary. Pass a stable `component` (module-level or memoized) — an inline one remounts on every parent render. The built-in defaults are exported as `DRIVE_ATTACHMENT_TAB_CONFIG`.
- `FileTypeIcon`, `getFileTypeConfig` — outline file/folder icon with a file-type glyph by extension.

See `main-app/src/app/main/Timesheet/components/LogTimePopover.js` for a live example of both.
