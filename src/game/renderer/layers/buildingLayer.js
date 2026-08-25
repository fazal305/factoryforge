import { worldToScreen } from '../camera.js'
import { BUILD_CATEGORY, BUILDINGS } from '../../../data/buildings.js'

const CATEGORY_COLOR = {
  [BUILD_CATEGORY.MINING]: '#c97e17',
  [BUILD_CATEGORY.LOGISTICS]: '#4c9be0',
  [BUILD_CATEGORY.PRODUCTION]: '#b5482f',
  [BUILD_CATEGORY.POWER]: '#e0a72e',
  [BUILD_CATEGORY.STORAGE]: '#5c7a5e',
}

/** The iso-projected silhouette of a building's footprint, in screen space. */
function footprintPolygon(camera, canvasWidth, canvasHeight, building) {
  const { x, y, footprint } = building
  const corners = [
    [x, y],
    [x + footprint.width, y],
    [x + footprint.width, y + footprint.height],
    [x, y + footprint.height],
  ]
  return corners.map(([tx, ty]) => worldToScreen(camera, canvasWidth, canvasHeight, tx, ty))
}

function drawPolygon(ctx, points) {
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
}

export function drawBuildingLayer(ctx, simulation, camera, canvasWidth, canvasHeight, range, selectedBuildingId) {
  for (const building of simulation.buildings) {
    const { x, y, footprint } = building
    // Cheap AABB cull against the culled tile range.
    if (x + footprint.width < range.minX || x > range.maxX + 1) continue
    if (y + footprint.height < range.minY || y > range.maxY + 1) continue

    const def = BUILDINGS[building.typeId]
    const points = footprintPolygon(camera, canvasWidth, canvasHeight, building)

    ctx.fillStyle = CATEGORY_COLOR[def.category] ?? '#888'
    drawPolygon(ctx, points)
    ctx.fill()

    ctx.strokeStyle = building.id === selectedBuildingId ? '#f4a52a' : 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = building.id === selectedBuildingId ? 2.5 : 1
    ctx.stroke()

    const center = worldToScreen(
      camera,
      canvasWidth,
      canvasHeight,
      x + footprint.width / 2,
      y + footprint.height / 2,
    )
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.font = `${Math.max(9, 11 * camera.zoom)}px var(--ff-font-ui, sans-serif)`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(def.name[0], center.x, center.y)
  }
}
