<script lang="ts">
  import { onMount } from 'svelte'
  import { applyTheme, loadTheme, persistTheme, type Theme } from './theme.js'
  import { apps, patches } from './tiles.js'
  import { fetchLatestVersion } from './versions.js'

  // Initial paint already done by main.ts before mount — this state
  // just tracks the same value so the toggle button knows which icon
  // to draw.
  let theme = $state<Theme>(loadTheme())

  /**
   * Per-app version map. Three states per entry:
   *   - `undefined` — still fetching (rendered as nothing → no jump)
   *   - `null` — fetch returned no version (rare, but possible:
   *     repo with no releases / no tags / API errored). Renders empty.
   *   - `string` — display as-is, e.g. `v0.7.0`.
   */
  let versions = $state<Record<string, string | null | undefined>>({})

  onMount(() => {
    // Fire all four requests in parallel; let each tile update as
    // soon as its own response lands. No spinner — empty space is
    // less distracting than a flicker on first paint.
    for (const tile of apps) {
      fetchLatestVersion(tile.name).then((v) => {
        versions[tile.name] = v
      })
    }
  })

  function toggleTheme(): void {
    theme = theme === 'light' ? 'dark' : 'light'
    applyTheme(theme)
    persistTheme(theme)
  }

  /**
   * Apps named EDIABASX / INPAX / NCSX / NFSX / TUNEX / XBUSX all
   * share the "stem + trailing X" pattern — paint the X in M-red to
   * mirror the accent each individual app's web UI uses for its own
   * title.
   */
  function splitAppName(name: string): { stem: string; x: string } {
    if (name.endsWith('X')) return { stem: name.slice(0, -1), x: 'X' }
    return { stem: name, x: '' }
  }
</script>

<div class="m-stripe" aria-hidden="true">
  <div class="m-stripe__band m-stripe__band--light"></div>
  <div class="m-stripe__band m-stripe__band--dark"></div>
  <div class="m-stripe__band m-stripe__band--red"></div>
</div>

<header>
  <h1 class="brand">bimmerz</h1>
  <button
    class="theme-toggle"
    type="button"
    onclick={toggleTheme}
    aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
  >
    {#if theme === 'light'}
      <!-- moon icon -->
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    {:else}
      <!-- sun icon -->
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2" />
        <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
          <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
          <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
        </g>
      </svg>
    {/if}
  </button>
</header>

<main>
  <!-- Group 1: the browser apps. Big tiles, M-red trailing X. -->
  <ul class="tiles tiles--apps">
    {#each apps as tile (tile.href)}
      {@const parts = splitAppName(tile.name)}
      {@const version = versions[tile.name]}
      <li class="tile tile--app">
        <a href={tile.href} target="_blank" rel="noopener noreferrer">
          <span class="tile__stack">
            <span class="tile__name tile__name--app">
              <span>{parts.stem}</span><span class="tile__name-accent">{parts.x}</span>
            </span>
            {#if version}
              <span class="tile__version">{version}</span>
            {/if}
          </span>
        </a>
      </li>
    {/each}
  </ul>

  <!-- Group 2: community-patch repos. Smaller tiles, friendlier names. -->
  <ul class="tiles tiles--patches">
    {#each patches as tile (tile.href)}
      <li class="tile tile--patches">
        <a href={tile.href} target="_blank" rel="noopener noreferrer">
          <span class="tile__name tile__name--patches">{tile.name}</span>
        </a>
      </li>
    {/each}
  </ul>

  <!-- Group 3: the docs/landing site, presented as prose rather than
       a tile — it's not "another app", it's the place to learn what
       all this is. -->
  <p class="learn-more">
    To learn more about the bimmerz suite — what each tool does, where
    to get the data files, who's behind it — visit
    <a class="learn-more__link" href="https://bimmerz.app">bimmerz.app</a>.
  </p>
</main>

<footer>
  <a href="https://github.com/emdzej" target="_blank" rel="noopener noreferrer">github.com/emdzej</a>
</footer>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px 0;
    max-width: 1100px;
    margin: 0 auto;
  }

  .brand {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(
      135deg,
      var(--m-light) 0%,
      var(--m-dark) 55%,
      var(--m-red) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--fg-muted);
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
  }
  .theme-toggle:hover {
    border-color: var(--m-light);
    color: var(--fg);
    background: var(--tile-bg-hover);
  }
  .theme-toggle:focus-visible {
    outline: 2px solid var(--m-light);
    outline-offset: 2px;
  }

  main {
    max-width: 1100px;
    margin: 0 auto;
    /* Bottom padding clears the fixed footer (~46px tall) so the
     * learn-more block doesn't slide under it. */
    padding: 24px 32px 80px;
  }

  .tiles {
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: grid;
    gap: 16px;
  }

  /* Apps: spacious tiles, big name. */
  .tiles--apps {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .tile--app a {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 140px;
    padding: 20px;
    background: var(--tile-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: var(--tile-shadow);
    text-align: center;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }
  .tile--app a:hover {
    transform: translateY(-2px);
    border-color: var(--m-light);
    background: var(--tile-bg-hover);
    box-shadow: var(--tile-shadow-hover);
  }
  .tile--app a:focus-visible {
    outline: 2px solid var(--m-light);
    outline-offset: 2px;
  }
  /* Inner column inside an app tile — stacks the name on top of the
   * version line. The version reserves no space when unset, so a
   * still-loading tile centres on the name alone (no jump when the
   * fetch resolves a moment later — the name shifts up slightly but
   * the tile itself stays a stable size). */
  .tile__stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .tile__name {
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .tile__name--app {
    font-size: 32px;
    color: var(--fg);
  }
  .tile__name-accent {
    color: var(--m-red);
  }
  .tile__version {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    color: var(--fg-faint);
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .tile--app a:hover .tile__version {
    color: var(--fg-muted);
  }

  /* Patches: smaller tiles, narrower grid (these are secondary
   * content next to the apps). */
  .tiles--patches {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .tile--patches a {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    padding: 12px 16px;
    background: var(--tile-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--tile-shadow);
    text-align: center;
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }
  .tile--patches a:hover {
    transform: translateY(-1px);
    border-color: var(--m-red);
    background: var(--tile-bg-hover);
    box-shadow: var(--tile-shadow-hover);
  }
  .tile--patches a:focus-visible {
    outline: 2px solid var(--m-red);
    outline-offset: 2px;
  }
  .tile__name--patches {
    font-size: 15px;
    color: var(--fg-muted);
    font-weight: 600;
    letter-spacing: 0;
  }
  .tile--patches a:hover .tile__name--patches {
    color: var(--fg);
  }

  /* Learn-more block. Prose, not a tile — bimmerz.app is the
   * "what is all this?" entrypoint, not a sibling app. */
  .learn-more {
    margin: 8px 0 0;
    padding: 20px 24px;
    background: var(--tile-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--fg-muted);
    font-size: 15px;
    line-height: 1.6;
  }
  .learn-more__link {
    color: var(--fg);
    font-weight: 600;
    background: linear-gradient(
      135deg,
      var(--m-light) 0%,
      var(--m-dark) 55%,
      var(--m-red) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: opacity 0.15s ease;
  }
  .learn-more__link:hover {
    opacity: 0.7;
  }

  /* Footer pinned to the viewport bottom — always visible regardless
   * of scroll position. Backdrop blur + bg colour keeps it readable
   * when content would otherwise scroll behind it. Bottom padding on
   * <main> keeps the learn-more block from being hidden underneath. */
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 12px 32px;
    color: var(--fg-faint);
    font-size: 13px;
    text-align: center;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-top: 1px solid var(--border);
  }
  footer a {
    color: var(--fg-muted);
    transition: color 0.15s ease;
  }
  footer a:hover {
    color: var(--m-light);
  }

  @media (max-width: 600px) {
    header {
      padding: 20px 20px 0;
    }
    main {
      padding: 20px 20px 36px;
    }
    .tile--app a {
      height: 120px;
    }
    .tile__name--app {
      font-size: 26px;
    }
  }
</style>
