import { BUILD_CATEGORY } from '../../data/buildings.js'
import { rotatedFootprint, footprintTiles } from './footprint.js'
import { DEPOSIT_RESOURCE_ID } from '../world/WorldGrid.js'

let nextBuildingId = 1

/** Picks the richest deposit tile under a mining drill's footprint, if any. */
function findDeposit(world, x, y, footprint) {
  let best = null
  for (const tile of footprintTiles(x, y, footprint)) {
    const i = world.index(tile.x, tile.y)
    const depositType = world.deposit[i]
    if (depositType === 0) continue
    if (!best || world.depositAmount[i] > best.amount) {
      best = { tileIndex: i, type: depositType, amount: world.depositAmount[i] }
    }
  }
  return best
}

/**
 * A placed building instance. Static stats (cost, power, footprint
 * shape, mining speed) live in data/buildings.js and are looked up by
 * typeId — this object only holds what's specific to *this*
 * placement: where it is, its rotation, and runtime production state.
 *
 * Runtime fields are conditional on the building's role so a storage
 * chest doesn't carry unused recipe fields and a furnace doesn't carry
 * unused deposit fields:
 *  - mining: depositTileIndex/depositResourceId/progress/outputBuffer
 *  - recipe-capable (furnace/assembler): recipeId/inputBuffer/
 *    outputBuffer/progress/processing/status
 */
export function createBuilding(typeId, def, x, y, rotation, world) {
  const building = {
    id: nextBuildingId++,
    typeId,
    x,
    y,
    rotation,
    footprint: rotatedFootprint(def.footprint, rotation),
  }

  if (def.category === BUILD_CATEGORY.MINING) {
    const deposit = findDeposit(world, x, y, building.footprint)
    building.depositTileIndex = deposit?.tileIndex ?? null
    building.depositResourceId = deposit ? DEPOSIT_RESOURCE_ID[deposit.type] : null
    building.progress = 0
    building.outputBuffer = new Map()
  }

  if (def.recipeCapable) {
    building.recipeId = null
    building.inputBuffer = new Map()
    building.outputBuffer = new Map()
    building.progress = 0
    building.processing = false
    building.status = 'idle'
  }

  return building
}

// Exposed for tests / save-load (Step 12) to keep ids unique across a session.
export function resetBuildingIdCounter(startAt = 1) {
  nextBuildingId = startAt
}
