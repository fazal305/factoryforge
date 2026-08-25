import { worldToScreen } from '../camera.js'
import { directionDelta } from '../../world/directions.js'
import { RESOURCES } from '../../../data/resources.js'
import { resolveTokenColor } from '../colorTokens.js'

const BELT_TYPES = new Set(['conveyor', 'undergroundConveyor'])

function drawArrow(ctx, camera, canvasWidth, canvasHeight, x, y, rotation, color) {
  const { dx, dy } = directionDelta(rotation)
  const from = worldToScreen(camera, canvasWidth, canvasHeight, x + 0.5 - dx * 0.3, y + 0.5 - dy * 0.3)
  const to = worldToScreen(camera, canvasWidth, canvasHeight, x + 0.5 + dx * 0.3, y + 0.5 + dy * 0.3)

  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(1.5, 2 * camera.zoom)
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const headLength = Math.max(4, 5 * camera.zoom)
  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/** Belt direction arrows + moving items, and a direction arrow for inserters. */
export function drawLogisticsLayer(ctx, simulation, camera, canvasWidth, canvasHeight, range) {
  const itemRadius = Math.max(2, 4 * camera.zoom)

  for (const building of simulation.buildings) {
    const { x, y } = building
    if (x < range.minX - 1 || x > range.maxX + 1 || y < range.minY - 1 || y > range.maxY + 1) continue

    if (BELT_TYPES.has(building.typeId)) {
      drawArrow(ctx, camera, canvasWidth, canvasHeight, x, y, building.rotation, 'rgba(255, 255, 255, 0.55)')

      const { dx, dy } = directionDelta(building.rotation)
      for (const item of building.items) {
        const itemX = x + 0.5 + dx * (item.distance - 0.5)
        const itemY = y + 0.5 + dy * (item.distance - 0.5)
        const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, itemX, itemY)

        ctx.fillStyle = resolveTokenColor(RESOURCES[item.resourceId]?.color ?? '#ffffff')
        ctx.beginPath()
        ctx.arc(sx, sy, itemRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    } else if (building.typeId === 'inserter') {
      drawArrow(ctx, camera, canvasWidth, canvasHeight, x, y, building.rotation, '#f4a52a')
    }
  }
}
