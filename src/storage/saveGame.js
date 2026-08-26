import { WorldGrid } from '../game/world/WorldGrid.js'
import { footprintTiles } from '../game/entities/footprint.js'
import { resetBuildingIdCounter } from '../game/entities/Building.js'
import { Inventory } from '../game/simulation/Inventory.js'
import { SimulationState } from '../game/simulation/SimulationState.js'
import { putSaveRecord, getSaveRecord, listSaveRecords, deleteSaveRecord } from './db.js'

export const SAVE_VERSION = 1

function serializeInventory(inventory) {
  return { capacityOverride: inventory.capacityOverride, stacks: [...inventory.entries()] }
}

function deserializeInventory(data) {
  const inventory = new Inventory(data.capacityOverride)
  for (const [resourceId, qty] of data.stacks) inventory.add(resourceId, qty)
  return inventory
}

// Storage chests use the same Inventory instance for input and output;
// preserving that sharing matters — otherwise a loaded chest would
// silently split into two out-of-sync buffers.
function serializeBuilding(building) {
  const shared = building.inputBuffer && building.inputBuffer === building.outputBuffer
  const record = { ...building, sharedBuffer: shared }
  if (building.inputBuffer) record.inputBuffer = serializeInventory(building.inputBuffer)
  if (building.outputBuffer) record.outputBuffer = shared ? null : serializeInventory(building.outputBuffer)
  delete record.networkId // transient, recomputed by tickPower every tick
  return record
}

function deserializeBuilding(record) {
  const building = { ...record }
  delete building.sharedBuffer
  if (record.inputBuffer) building.inputBuffer = deserializeInventory(record.inputBuffer)
  if (record.sharedBuffer) building.outputBuffer = building.inputBuffer
  else if (record.outputBuffer) building.outputBuffer = deserializeInventory(record.outputBuffer)
  return building
}

/** Plain-JSON snapshot of everything needed to resume the game exactly. */
export function serializeSimulation(simulation, gameLoop) {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    world: {
      width: simulation.world.width,
      height: simulation.world.height,
      terrain: Array.from(simulation.world.terrain),
      deposit: Array.from(simulation.world.deposit),
      depositAmount: Array.from(simulation.world.depositAmount),
    },
    buildings: simulation.buildings.map(serializeBuilding),
    playerInventory: [...simulation.playerInventory.entries()],
    research: {
      completed: [...simulation.completedResearch],
      active: simulation.activeResearchId,
      progress: [...simulation.researchProgressByNode.entries()],
    },
    simTime: gameLoop.simTimeSeconds,
    tickCount: gameLoop.tickCount,
  }
}

/** Validates shape before anything touches the engine — a malformed import should fail loudly, not half-load. */
export function validateSaveData(data) {
  if (!data || typeof data !== 'object') throw new Error('Save file is not a valid object')
  if (data.version !== SAVE_VERSION) throw new Error(`Unsupported save version: ${data.version}`)

  const world = data.world
  if (!world || typeof world.width !== 'number' || typeof world.height !== 'number') {
    throw new Error('Save is missing world dimensions')
  }
  const expectedSize = world.width * world.height
  for (const key of ['terrain', 'deposit', 'depositAmount']) {
    if (!Array.isArray(world[key]) || world[key].length !== expectedSize) {
      throw new Error(`World layer "${key}" is missing or the wrong size`)
    }
  }

  if (!Array.isArray(data.buildings)) throw new Error('Save is missing a buildings list')
  if (!Array.isArray(data.playerInventory)) throw new Error('Save is missing player inventory')
  if (!data.research || !Array.isArray(data.research.completed) || !Array.isArray(data.research.progress)) {
    throw new Error('Save is missing research state')
  }
}

export function deserializeSimulation(data) {
  validateSaveData(data)

  const world = new WorldGrid(data.world.width, data.world.height, {
    terrain: Uint8Array.from(data.world.terrain),
    deposit: Uint8Array.from(data.world.deposit),
    depositAmount: Uint16Array.from(data.world.depositAmount),
    buildingId: new Int16Array(data.world.width * data.world.height).fill(-1),
  })

  const simulation = new SimulationState(world)
  simulation.playerInventory = new Inventory()
  for (const [resourceId, qty] of data.playerInventory) simulation.playerInventory.add(resourceId, qty)

  simulation.buildings = data.buildings.map(deserializeBuilding)
  simulation.buildingsById = new Map(simulation.buildings.map((b) => [b.id, b]))
  for (const building of simulation.buildings) {
    for (const tile of footprintTiles(building.x, building.y, building.footprint)) {
      world.buildingId[world.index(tile.x, tile.y)] = building.id
    }
  }

  simulation.completedResearch = new Set(data.research.completed)
  simulation.activeResearchId = data.research.active
  simulation.researchProgressByNode = new Map(data.research.progress)

  const maxId = simulation.buildings.reduce((max, b) => Math.max(max, b.id), 0)
  resetBuildingIdCounter(maxId + 1)

  return { simulation, simTime: data.simTime ?? 0, tickCount: data.tickCount ?? 0 }
}

export async function saveGame(name, simulation, gameLoop) {
  const data = serializeSimulation(simulation, gameLoop)
  await putSaveRecord({ name, savedAt: data.savedAt, data })
}

/** Returns the raw, validated save payload — for handing to GameCanvas's `initialSave`. */
export async function getSaveData(name) {
  const record = await getSaveRecord(name)
  if (!record) throw new Error(`No save named "${name}"`)
  validateSaveData(record.data)
  return record.data
}

export async function listSaves() {
  const records = await listSaveRecords()
  return records.map((r) => ({ name: r.name, savedAt: r.savedAt })).sort((a, b) => b.savedAt - a.savedAt)
}

export async function deleteSave(name) {
  await deleteSaveRecord(name)
}
