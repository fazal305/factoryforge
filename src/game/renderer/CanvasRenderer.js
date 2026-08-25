import { computeVisibleTileRange } from './viewportCulling.js'
import { drawTerrainLayer } from './layers/terrainLayer.js'
import { drawResourceLayer } from './layers/resourceLayer.js'
import { drawBuildingLayer } from './layers/buildingLayer.js'
import { drawLogisticsLayer } from './layers/logisticsLayer.js'
import { drawPlacementGhostLayer } from './layers/placementGhostLayer.js'
import { drawSelectionLayer } from './layers/selectionLayer.js'

/**
 * Draws one frame. Called from the RAF loop in GameCanvas — never from
 * React's render cycle. Every layer only visits the culled tile range,
 * not the full grid, so cost scales with viewport size, not world size.
 */
export function drawFrame(ctx, simulation, camera, canvasWidth, canvasHeight, hoverTile, selectedTile, buildMode, selectedBuildingId) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const world = simulation.world
  const range = computeVisibleTileRange(camera, canvasWidth, canvasHeight, world.width, world.height)

  drawTerrainLayer(ctx, world, camera, canvasWidth, canvasHeight, range)
  drawResourceLayer(ctx, world, camera, canvasWidth, canvasHeight, range)
  drawBuildingLayer(ctx, simulation, camera, canvasWidth, canvasHeight, range, selectedBuildingId)
  drawLogisticsLayer(ctx, simulation, camera, canvasWidth, canvasHeight, range)
  drawPlacementGhostLayer(ctx, simulation, camera, canvasWidth, canvasHeight, buildMode, hoverTile)
  drawSelectionLayer(ctx, world, camera, canvasWidth, canvasHeight, hoverTile, selectedTile)

  return range
}
