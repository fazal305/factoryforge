import { EventBus } from '../engine/EventBus.js'

/**
 * The engine-owned world: the WorldGrid plus everything that isn't a
 * pure terrain fact — buildings, conveyor items, and so on as those
 * systems come online (Step 6+). Deliberately not a Zustand store: it
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

    // Populated by later steps: buildings (Step 6), conveyor item flow
    // (Step 8), power grid (Step 9).
    this.buildings = []
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
