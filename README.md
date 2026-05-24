# bimmerz-hub

A tiny launcher dashboard for the [bimmerz](https://bimmerz.app)
toolchain. One page, no settings, just links — to each browser app, to
the docs site, and to the community-patch repos.

Lives at [hub.bimmerz.app](https://hub.bimmerz.app).

## What's in it

Tile grid pointing at:

- **bimmerz.app** — the docs / landing site
- **EDIABASX** — diagnostics in a browser tab
- **INPAX** — BMW's diagnostic scripts in a browser
- **NCSX** — coding in plain English
- **XBUSX** — I-Bus / K-Bus comfort traffic
- **ipo-community-patches** — translations + tweaks for INPA `.IPO` files
- **ncsx-community-patches** — `.ncsxpatch.yaml` retrofits for NCSX

## Theme

Light / dark only — no settings panel. Toggle button is top-right.
First-time visitors get whatever their OS prefers; choice is persisted
to `localStorage` after that.

## Stack

Svelte 5 + Vite + TypeScript, mirroring the other apps. Standalone — no
workspace deps.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5180
pnpm build      # dist/ for deploy
pnpm typecheck
```

## Deploy

GitHub Pages — auto-deploys on push to `main` (the hub is just a
static list of links; every change is publishable). Manual
`workflow_dispatch` is also available from the Actions tab for forced
redeploys without a code change.
