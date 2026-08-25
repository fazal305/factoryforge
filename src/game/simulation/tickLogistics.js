import { BUILDINGS } from '../../data/buildings.js'
import { directionDelta } from '../world/directions.js'
import { BELT_TYPES, ITEM_SPACING } from './constants.js'

function isConveyor(building) {
  return BELT_TYPES.has(building.typeId)
}

function buildingAt(simulation, x, y) {
  const id = simulation.world.buildingId[simulation.world.index(x, y)]
  return id === -1 ? null : simulation.buildingsById.get(id)
}

/**
 * Conveyor item movement, in two passes so a transfer between belts
 * never depends on iteration order:
 *
 *  1. Intra-tile: every belt's items advance toward its exit (distance
 *     1), lead-to-tail, each one capped by the gap to the item ahead
 *     of it (or to the exit, for the lead item) — this is what keeps
 *     items from stacking on top of each other.
 *  2. Cross-tile: any lead item that reached its exit tries to hop
 *     onto the next tile — but only if that tile is another conveyor;
 *     a belt that runs into a wall, empty ground, or the side of a
 *     machine just backs up at distance 1, same as it would in
 *     Factorio. Getting an item into a machine is an inserter's job
 *     (tickInserters.js), not the belt's.
 */
export function tickLogistics(simulation, dt) {
  const world = simulation.world

  for (const building of simulation.buildings) {
    if (!isConveyor(building)) continue
    const items = building.items
    if (items.length === 0) continue

    const step = dt * BUILDINGS[building.typeId].beltSpeed

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const spaceAhead = i === 0 ? 1 - item.distance : items[i - 1].distance - ITEM_SPACING - item.distance
      item.distance += Math.min(step, Math.max(0, spaceAhead))
    }
  }

  for (const building of simulation.buildings) {
    if (!isConveyor(building)) continue
    const items = building.items
    if (items.length === 0) continue

    const lead = items[0]
    if (lead.distance < 1) continue

    const { dx, dy } = directionDelta(building.rotation)
    const nx = building.x + dx
    const ny = building.y + dy
    const nextBuilding = world.inBounds(nx, ny) ? buildingAt(simulation, nx, ny) : null

    if (nextBuilding && isConveyor(nextBuilding)) {
      const nextItems = nextBuilding.items
      const tailDistance = nextItems.length > 0 ? nextItems[nextItems.length - 1].distance : Infinity
      if (tailDistance >= ITEM_SPACING) {
        items.shift()
        nextItems.push({
          resourceId: lead.resourceId,
          distance: Math.min(lead.distance - 1, tailDistance - ITEM_SPACING),
        })
        continue
      }
    }

    lead.distance = 1
  }
}
