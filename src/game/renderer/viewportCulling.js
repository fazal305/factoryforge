import { screenToWorld } from './camera.js'

/**
 * Returns the tile-space bounding box currently visible on screen, with
 * a small margin so tiles partially off-screen still draw. The renderer
 * iterates only this range instead of the whole grid.
 */
export function computeVisibleTileRange(camera, canvasWidth, canvasHeight, worldWidth, worldHeight, margin = 2) {
  const corners = [
    screenToWorld(camera, canvasWidth, canvasHeight, 0, 0),
    screenToWorld(camera, canvasWidth, canvasHeight, canvasWidth, 0),
    screenToWorld(camera, canvasWidth, canvasHeight, 0, canvasHeight),
    screenToWorld(camera, canvasWidth, canvasHeight, canvasWidth, canvasHeight),
  ]

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const corner of corners) {
    if (corner.x < minX) minX = corner.x
    if (corner.x > maxX) maxX = corner.x
    if (corner.y < minY) minY = corner.y
    if (corner.y > maxY) maxY = corner.y
  }

  return {
    minX: Math.max(0, Math.floor(minX - margin)),
    maxX: Math.min(worldWidth - 1, Math.ceil(maxX + margin)),
    minY: Math.max(0, Math.floor(minY - margin)),
    maxY: Math.min(worldHeight - 1, Math.ceil(maxY + margin)),
  }
}
