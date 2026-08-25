import { worldToScreen } from '../camera.js'
import { TILE_HEIGHT, TILE_WIDTH } from '../isoProjection.js'

function outlineDiamond(ctx, cx, cy, halfW, halfH) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - halfH)
  ctx.lineTo(cx + halfW, cy)
  ctx.lineTo(cx, cy + halfH)
  ctx.lineTo(cx - halfW, cy)
  ctx.closePath()
  ctx.stroke()
}

export function drawSelectionLayer(ctx, world, camera, canvasWidth, canvasHeight, hoverTile, selectedTile) {
  const halfW = (TILE_WIDTH / 2) * camera.zoom
  const halfH = (TILE_HEIGHT / 2) * camera.zoom

  if (hoverTile && world.inBounds(hoverTile.x, hoverTile.y)) {
    const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, hoverTile.x, hoverTile.y)
    ctx.strokeStyle = 'rgba(244, 165, 42, 0.55)'
    ctx.lineWidth = 1.5
    outlineDiamond(ctx, sx, sy, halfW, halfH)
  }

  if (selectedTile && world.inBounds(selectedTile.x, selectedTile.y)) {
    const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, selectedTile.x, selectedTile.y)
    ctx.strokeStyle = '#f4a52a'
    ctx.lineWidth = 2.5
    outlineDiamond(ctx, sx, sy, halfW, halfH)
  }
}
