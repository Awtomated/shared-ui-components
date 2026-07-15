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

See each component's usage in `main-app/src/app/main/Timesheet` for a live example.
