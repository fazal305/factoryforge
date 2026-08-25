/** A building's footprint swaps width/height at 90°/270° rotation. */
export function rotatedFootprint(footprint, rotation) {
  const flipped = rotation === 90 || rotation === 270
  return flipped
    ? { width: footprint.height, height: footprint.width }
    : { width: footprint.width, height: footprint.height }
}

/** Yields every tile-space {x, y} the footprint covers, anchored at originX/originY. */
export function* footprintTiles(originX, originY, footprint) {
  for (let dy = 0; dy < footprint.height; dy++) {
    for (let dx = 0; dx < footprint.width; dx++) {
      yield { x: originX + dx, y: originY + dy }
    }
  }
}
