import { BUILDINGS } from '../../data/buildings.js'
import {
  clearFootprint,
  deductCost,
  placeBuilding,
  refundCost,
  registerBuilding,
  unregisterBuilding,
  writeFootprint,
} from '../world/placement.js'

/**
 * Command factories for CommandHistory. Each command captures the
 * building object on first `do()` so `redo()` restores the exact same
 * entity (same id) rather than creating a new one.
 */
export function createPlaceCommand(simulation, typeId, x, y, rotation) {
  const def = BUILDINGS[typeId]
  let building = null

  return {
    label: `Place ${def.name}`,
    do() {
      if (!building) {
        building = placeBuilding(simulation, typeId, x, y, rotation)
      } else {
        writeFootprint(simulation.world, building)
        deductCost(simulation, def.cost)
        registerBuilding(simulation, building)
      }
    },
    undo() {
      clearFootprint(simulation.world, building)
      unregisterBuilding(simulation, building)
      refundCost(simulation, def.cost)
    },
  }
}

export function createRemoveCommand(simulation, buildingId) {
  const building = simulation.buildingsById.get(buildingId)
  if (!building) return null

  return {
    label: `Remove ${BUILDINGS[building.typeId].name}`,
    do() {
      clearFootprint(simulation.world, building)
      unregisterBuilding(simulation, building)
    },
    undo() {
      writeFootprint(simulation.world, building)
      registerBuilding(simulation, building)
    },
  }
}
