import { worldToScreen } from '../camera.js'
import { BUILDINGS } from '../../../data/buildings.js'

const RING_SEGMENTS = 32

/**
 * Draws the coverage ring for the selected power pole only — always
 * rendering every pole's range would clutter the view once a grid gets
 * large, and the range only matters while you're deciding where to
 * extend it.
 */
export function drawPowerRangeLayer(ctx, simulation, camera, canvasWidth, canvasHeight, selectedBuildingId) {
  if (selectedBuildingId == null) return

  const building = simulation.buildingsById.get(selectedBuildingId)
  if (!building || building.typeId !== 'powerPole') return

  const range = BUILDINGS.powerPole.powerRange
  const cx = building.x + building.footprint.width / 2
  const cy = building.y + building.footprint.height / 2

  ctx.beginPath()
  for (let i = 0; i <= RING_SEGMENTS; i++) {
    const angle = (i / RING_SEGMENTS) * Math.PI * 2
    const tileX = cx + Math.cos(angle) * range
    const tileY = cy + Math.sin(angle) * range
    const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, tileX, tileY)
    if (i === 0) ctx.moveTo(sx, sy)
    else ctx.lineTo(sx, sy)
  }
  ctx.closePath()

  ctx.strokeStyle = 'rgba(224, 167, 46, 0.7)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = 'rgba(224, 167, 46, 0.06)'
  ctx.fill()
}
