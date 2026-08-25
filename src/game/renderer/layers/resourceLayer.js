import { worldToScreen } from '../camera.js'
import { TILE_HEIGHT } from '../isoProjection.js'
import { DEPOSIT, DEPOSIT_RESOURCE_ID } from '../../world/WorldGrid.js'
import { RESOURCES } from '../../../data/resources.js'

export function drawResourceLayer(ctx, world, camera, canvasWidth, canvasHeight, range) {
  const radius = Math.max(2, (TILE_HEIGHT / 5) * camera.zoom)

  for (let y = range.minY; y <= range.maxY; y++) {
    for (let x = range.minX; x <= range.maxX; x++) {
      const i = world.index(x, y)
      const depositType = world.deposit[i]
      if (depositType === DEPOSIT.NONE) continue

      const resource = RESOURCES[DEPOSIT_RESOURCE_ID[depositType]]
      const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, x, y)

      ctx.fillStyle = resolveTokenColor(resource.color)
      ctx.beginPath()
      ctx.arc(sx, sy, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Resource colors are defined as CSS custom properties so the HUD and
// canvas stay in sync; the canvas 2D context needs the resolved value.
let cachedStyle = null
function resolveTokenColor(cssVarExpr) {
  if (!cachedStyle) cachedStyle = getComputedStyle(document.documentElement)
  const match = /var\((--[\w-]+)\)/.exec(cssVarExpr)
  if (!match) return cssVarExpr
  return cachedStyle.getPropertyValue(match[1]).trim() || '#999'
}

export function invalidateColorCache() {
  cachedStyle = null
}
