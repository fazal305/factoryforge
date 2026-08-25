import { computeVisibleTileRange } from './viewportCulling.js'
import { drawTerrainLayer } from './layers/terrainLayer.js'
import { drawResourceLayer } from './layers/resourceLayer.js'
import { drawSelectionLayer } from './layers/selectionLayer.js'

/**
 * Draws one frame. Called from the RAF loop in GameCanvas — never from
 * React's render cycle. Every layer only visits the culled tile range,
 * not the full grid, so cost scales with viewport size, not world size.
 */
export function drawFrame(ctx, world, camera, canvasWidth, canvasHeight, hoverTile, selectedTile) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const range = computeVisibleTileRange(camera, canvasWidth, canvasHeight, world.width, world.height)

  drawTerrainLayer(ctx, world, camera, canvasWidth, canvasHeight, range)
  drawResourceLayer(ctx, world, camera, canvasWidth, canvasHeight, range)
  drawSelectionLayer(ctx, world, camera, canvasWidth, canvasHeight, hoverTile, selectedTile)

  return range
}
