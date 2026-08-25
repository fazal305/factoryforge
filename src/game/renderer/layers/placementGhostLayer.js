import { worldToScreen } from '../camera.js'
import { BUILDINGS } from '../../../data/buildings.js'
import { rotatedFootprint } from '../../entities/footprint.js'
import { canPlaceBuilding } from '../../world/placement.js'

function footprintPolygon(camera, canvasWidth, canvasHeight, x, y, footprint) {
  const corners = [
    [x, y],
    [x + footprint.width, y],
    [x + footprint.width, y + footprint.height],
    [x, y + footprint.height],
  ]
  return corners.map(([tx, ty]) => worldToScreen(camera, canvasWidth, canvasHeight, tx, ty))
}

/** Draws a translucent green/red footprint preview under the cursor while a build tool is armed. */
export function drawPlacementGhostLayer(ctx, simulation, camera, canvasWidth, canvasHeight, buildMode, hoverTile) {
  if (!buildMode?.typeId || !hoverTile) return

  const def = BUILDINGS[buildMode.typeId]
  if (!def) return

  const footprint = rotatedFootprint(def.footprint, buildMode.rotation)
  const { valid } = canPlaceBuilding(simulation, buildMode.typeId, hoverTile.x, hoverTile.y, buildMode.rotation)
  const points = footprintPolygon(camera, canvasWidth, canvasHeight, hoverTile.x, hoverTile.y, footprint)

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()

  ctx.fillStyle = valid ? 'rgba(76, 175, 125, 0.35)' : 'rgba(226, 96, 79, 0.35)'
  ctx.fill()
  ctx.strokeStyle = valid ? '#4caf7d' : '#e2604f'
  ctx.lineWidth = 2
  ctx.stroke()
}
