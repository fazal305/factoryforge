/**
 * 2:1 isometric projection. Tile-space (x, y) are grid coordinates;
 * iso-space is the unscaled, unpanned pixel plane the diamonds occupy
 * before the camera's zoom/pan is applied.
 */
export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32

export function tileToIso(tileX, tileY) {
  return {
    x: (tileX - tileY) * (TILE_WIDTH / 2),
    y: (tileX + tileY) * (TILE_HEIGHT / 2),
  }
}

export function isoToTile(isoX, isoY) {
  const x = isoX / (TILE_WIDTH / 2)
  const y = isoY / (TILE_HEIGHT / 2)
  return {
    x: (x + y) / 2,
    y: (y - x) / 2,
  }
}
