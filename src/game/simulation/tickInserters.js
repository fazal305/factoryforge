import { BUILDINGS } from '../../data/buildings.js'
import { directionDelta } from '../world/directions.js'
import { BUFFER_CAP, ITEM_SPACING } from './constants.js'

function buildingAt(simulation, x, y) {
  if (!simulation.world.inBounds(x, y)) return null
  const id = simulation.world.buildingId[simulation.world.index(x, y)]
  return id === -1 ? null : simulation.buildingsById.get(id)
}

function pickAvailableResource(buffer) {
  for (const [resourceId, qty] of buffer) {
    if (qty > 0) return resourceId
  }
  return null
}

/**
 * An inserter looks at the tile behind it (source) and the tile ahead
 * of it (destination, both relative to its placement rotation) and,
 * on a fixed cooldown, moves one item from source to destination. It
 * only commits the take once the deposit has already succeeded, so a
 * jammed destination never silently deletes an item off a belt.
 */
export function tickInserters(simulation, dt) {
  for (const building of simulation.buildings) {
    if (building.typeId !== 'inserter') continue
    if (!building.powered) continue

    building.cooldown -= dt
    if (building.cooldown > 0) continue

    const { dx, dy } = directionDelta(building.rotation)
    const source = buildingAt(simulation, building.x - dx, building.y - dy)
    const dest = buildingAt(simulation, building.x + dx, building.y + dy)
    if (!source || !dest) continue

    const takingFromBelt = Array.isArray(source.items)
    const resourceId = takingFromBelt ? source.items[0]?.resourceId : pickAvailableResource(source.outputBuffer ?? [])
    if (!resourceId) continue

    let deposited = false
    if (Array.isArray(dest.items)) {
      const tailDistance = dest.items.length > 0 ? dest.items[dest.items.length - 1].distance : Infinity
      if (tailDistance >= ITEM_SPACING) {
        dest.items.push({ resourceId, distance: 0 })
        deposited = true
      }
    } else if (dest.inputBuffer) {
      const current = dest.inputBuffer.get(resourceId) ?? 0
      if (current < BUFFER_CAP) {
        dest.inputBuffer.set(resourceId, current + 1)
        deposited = true
      }
    }

    if (!deposited) continue

    if (takingFromBelt) {
      source.items.shift()
    } else {
      source.outputBuffer.set(resourceId, source.outputBuffer.get(resourceId) - 1)
    }

    building.cooldown = 1 / BUILDINGS.inserter.inserterSpeed
  }
}
