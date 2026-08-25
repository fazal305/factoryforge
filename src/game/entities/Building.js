import { rotatedFootprint } from './footprint.js'

let nextBuildingId = 1

/**
 * A placed building instance. Static stats (cost, power, footprint
 * shape) live in data/buildings.js and are looked up by typeId — this
 * object only holds what's specific to *this* placement: where it is,
 * how it's rotated, and its runtime state (progress/inventory arrive
 * with the production system in Step 7).
 */
export function createBuilding(typeId, def, x, y, rotation) {
  return {
    id: nextBuildingId++,
    typeId,
    x,
    y,
    rotation,
    footprint: rotatedFootprint(def.footprint, rotation),
  }
}

// Exposed for tests / save-load (Step 12) to keep ids unique across a session.
export function resetBuildingIdCounter(startAt = 1) {
  nextBuildingId = startAt
}
