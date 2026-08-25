/**
 * A building's rotation (0/90/180/270, set at placement) doubles as its
 * facing direction for conveyors and inserters — no separate field
 * needed. The mapping to a tile delta is arbitrary (doesn't need to
 * match compass directions); it only has to be consistent between the
 * simulation and the renderer, which projects it through the same iso
 * transform either way.
 */
const DIRECTION_DELTA = {
  0: { dx: 0, dy: -1 },
  90: { dx: 1, dy: 0 },
  180: { dx: 0, dy: 1 },
  270: { dx: -1, dy: 0 },
}

export function directionDelta(rotation) {
  return DIRECTION_DELTA[rotation] ?? DIRECTION_DELTA[0]
}
