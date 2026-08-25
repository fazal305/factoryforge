import { BUILDINGS } from '../../data/buildings.js'
import { RESOURCES } from '../../data/resources.js'
import { TERRAIN } from './WorldGrid.js'
import { createBuilding } from '../entities/Building.js'
import { footprintTiles, rotatedFootprint } from '../entities/footprint.js'

/**
 * Checks whether a building could be placed here without mutating
 * anything — used both to gate the real placement and to color the
 * placement ghost every frame.
 */
export function canPlaceBuilding(simulation, typeId, x, y, rotation) {
  const def = BUILDINGS[typeId]
  if (!def) return { valid: false, reason: 'Unknown building' }

  const world = simulation.world
  const footprint = rotatedFootprint(def.footprint, rotation)

  for (const tile of footprintTiles(x, y, footprint)) {
    if (!world.inBounds(tile.x, tile.y)) {
      return { valid: false, reason: 'Out of bounds' }
    }
    if (world.getTerrain(tile.x, tile.y) === TERRAIN.WATER) {
      return { valid: false, reason: 'Requires dry, flat terrain' }
    }
    if (world.buildingId[world.index(tile.x, tile.y)] !== -1) {
      return { valid: false, reason: 'Tile is occupied' }
    }
  }

  for (const [resourceId, qty] of Object.entries(def.cost)) {
    const have = simulation.playerInventory.get(resourceId) ?? 0
    if (have < qty) {
      return { valid: false, reason: `Not enough ${RESOURCES[resourceId].name}` }
    }
  }

  return { valid: true }
}

// --- granular world/inventory mutations, composed by placeBuilding /
// removeBuilding below and reused directly by the undo/redo commands
// in game/engine/constructionCommands.js so undo never has to
// re-derive placement logic. ---

export function writeFootprint(world, building) {
  for (const tile of footprintTiles(building.x, building.y, building.footprint)) {
    world.buildingId[world.index(tile.x, tile.y)] = building.id
  }
}

export function clearFootprint(world, building) {
  for (const tile of footprintTiles(building.x, building.y, building.footprint)) {
    world.buildingId[world.index(tile.x, tile.y)] = -1
  }
}

export function deductCost(simulation, cost) {
  for (const [resourceId, qty] of Object.entries(cost)) {
    simulation.playerInventory.set(resourceId, (simulation.playerInventory.get(resourceId) ?? 0) - qty)
  }
}

export function refundCost(simulation, cost) {
  for (const [resourceId, qty] of Object.entries(cost)) {
    simulation.playerInventory.set(resourceId, (simulation.playerInventory.get(resourceId) ?? 0) + qty)
  }
}

export function registerBuilding(simulation, building) {
  simulation.buildings.push(building)
  simulation.buildingsById.set(building.id, building)
  simulation.events.emit('buildingPlaced', building)
}

export function unregisterBuilding(simulation, building) {
  simulation.buildings = simulation.buildings.filter((b) => b.id !== building.id)
  simulation.buildingsById.delete(building.id)
  simulation.events.emit('buildingRemoved', building)
}

/** Caller must validate with canPlaceBuilding first. */
export function placeBuilding(simulation, typeId, x, y, rotation) {
  const def = BUILDINGS[typeId]
  const building = createBuilding(typeId, def, x, y, rotation)
  writeFootprint(simulation.world, building)
  deductCost(simulation, def.cost)
  registerBuilding(simulation, building)
  return building
}

/** Cost is not refunded on removal — undoing a removal doesn't refund either, so the two stay net-zero against each other. */
export function removeBuilding(simulation, buildingId) {
  const building = simulation.buildingsById.get(buildingId)
  if (!building) return null
  clearFootprint(simulation.world, building)
  unregisterBuilding(simulation, building)
  return building
}
