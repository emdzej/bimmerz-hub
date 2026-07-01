/**
 * Pull the latest published version for each app from the GitHub
 * Releases API. Tried at page load — failures (network, rate limit,
 * no-such-repo, no-releases-yet) are silent: the tile just doesn't
 * show a version line.
 *
 * Why releases-first, tags-fallback: not every app publishes proper
 * GitHub Releases (with notes / assets), but every released version
 * gets a git tag. Releases give the prettiest data when available;
 * tags are the reliable fallback.
 *
 * Unauthenticated API limit is 60 requests/hour per IP — well above
 * what a normal visit costs (4 calls, one per app).
 */

type Repo = { owner: string; repo: string }

const repos: Record<string, Repo> = {
  EDIABASX: { owner: 'emdzej', repo: 'ediabasx' },
  INPAX: { owner: 'emdzej', repo: 'inpax' },
  NCSX: { owner: 'emdzej', repo: 'ncsx' },
  NFSX: { owner: 'emdzej', repo: 'nfsx' },
  TUNEX: { owner: 'emdzej', repo: 'tunex' },
  XBUSX: { owner: 'emdzej', repo: 'xbusx' },
}

export async function fetchLatestVersion(appName: string): Promise<string | null> {
  const ref = repos[appName]
  if (!ref) return null

  // Releases/latest — only counts published, non-prerelease, non-draft.
  // Returns 404 if the repo has no releases that match those criteria.
  try {
    const rel = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (rel.ok) {
      const data = (await rel.json()) as { tag_name?: string }
      const tag = data.tag_name
      if (typeof tag === 'string' && tag.length > 0) return normalize(tag)
    }
    if (rel.status !== 404) return null

    // Fallback — first entry of /tags is the newest creation by API
    // contract, which for our repos matches the latest semver since
    // releases monotonically increase.
    const tags = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/tags?per_page=1`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (tags.ok) {
      const arr = (await tags.json()) as Array<{ name?: string }>
      if (Array.isArray(arr) && arr.length > 0) {
        const name = arr[0]?.name
        if (typeof name === 'string' && name.length > 0) return normalize(name)
      }
    }
  } catch {
    // Network / CORS / parse error — surface nothing rather than an
    // angry red flag on the tile.
  }
  return null
}

function normalize(tag: string): string {
  // GitHub tags vary — "v0.7.0", "0.7.0", "release-0.7.0". Strip the
  // common prefixes so all four tiles read the same way as the
  // in-app version pills (which display the bare semver).
  return tag.trim().replace(/^(release[-_]?|v)/i, '')
}
