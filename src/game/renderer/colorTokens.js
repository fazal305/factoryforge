/**
 * Resource colors are defined as CSS custom properties so the HUD and
 * canvas stay in sync; the canvas 2D context needs the resolved value,
 * so this resolves+caches it once per resize (colors don't change
 * mid-frame, and getComputedStyle is not free to call every draw).
 */
let cachedStyle = null

export function resolveTokenColor(cssVarExpr) {
  if (!cssVarExpr.startsWith('var(')) return cssVarExpr
  if (!cachedStyle) cachedStyle = getComputedStyle(document.documentElement)
  const match = /var\((--[\w-]+)\)/.exec(cssVarExpr)
  if (!match) return cssVarExpr
  return cachedStyle.getPropertyValue(match[1]).trim() || '#999'
}

export function invalidateColorCache() {
  cachedStyle = null
}
