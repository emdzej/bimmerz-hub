/**
 * Tile catalogues, split into two groups that render distinctly:
 *
 *   - `apps`    — the browser apps (xbusx/ncsx/inpax/ediabasx). Large
 *                 tiles with the trailing X painted in M-red.
 *   - `patches` — community-patch GitHub repos. Smaller tiles with
 *                 human-readable display names.
 *
 * `bimmerz.app` itself isn't a tile — it lives in the text block at
 * the bottom of the page.
 */
export type AppTile = { name: string; href: string }
export type PatchTile = { name: string; href: string }

export const apps: AppTile[] = [
  { name: 'EDIABASX', href: 'https://ediabasx.bimmerz.app' },
  { name: 'INPAX', href: 'https://inpax.bimmerz.app' },
  { name: 'NCSX', href: 'https://ncsx.bimmerz.app' },
  { name: 'TUNEX', href: 'https://tunex.bimmerz.app' },
  { name: 'XBUSX', href: 'https://xbusx.bimmerz.app' },
]

export const patches: PatchTile[] = [
  {
    name: 'IPO Community Patches',
    href: 'https://github.com/emdzej/ipo-community-patches',
  },
  {
    name: 'NCSX Community Patches',
    href: 'https://github.com/emdzej/ncsx-community-patches',
  },
]
