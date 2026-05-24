/**
 * Theme: light / dark with persisted choice. Mirrors the inpax + xbusx
 * pattern but without the settings dialog — toggle button is the only
 * UI. No "system" option here; visitors land, click, leave.
 */
const STORAGE_KEY = 'bimmerz-hub:theme'
export type Theme = 'light' | 'dark'

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // First visit — match the OS preference so the first paint feels native.
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export function persistTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, theme)
}
