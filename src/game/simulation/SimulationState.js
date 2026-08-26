import { EventBus } from '../engine/EventBus.js'
import { CommandHistory } from '../engine/CommandHistory.js'
import { Inventory } from './Inventory.js'

// Starting stock so building placement is testable before the mining
// and processing chain (Step 7) can produce these materials itself.
// Once extraction/production exist, a new game should start at zero
// and this bootstrap goes away.
const STARTING_INVENTORY = {
  ironPlate: 60,
  copperPlate: 30,
  stone: 40,
  gear: 20,
  circuit: 15,
  steel: 10,
}

/**
 * The engine-owned world: the WorldGrid plus everything that isn't a
 * pure terrain fact — buildings, conveyor items, and so on as those
 * systems come online (Step 8+). Deliberately not a Zustand store: it
 * mutates every tick, and routing that through React state would mean
 * a re-render per tick.
 *
 * Systems are plain functions of (simulation, dt) registered once and
 * run in order every tick — this is what "production/logistics/power
 * are data-driven systems, not scattered conditionals" means in
 * practice: each concern is one function, added independently.
 */
export class SimulationState {
  constructor(world) {
    this.world = world
    this.events = new EventBus()
    this.systems = []
    this.history = new CommandHistory()

    this.buildings = []
    this.buildingsById = new Map()

    this.playerInventory = new Inventory()
    for (const [resourceId, qty] of Object.entries(STARTING_INVENTORY)) {
      this.playerInventory.add(resourceId, qty)
    }

    this.powerSummary = { production: 0, consumption: 0, overloaded: false }

    this.completedResearch = new Set()
    this.activeResearchId = null
    this.researchProgressByNode = new Map()
  }

  registerSystem(system) {
    this.systems.push(system)
  }

  runTick(dt) {
    for (const system of this.systems) {
      system(this, dt)
    }
  }
}
