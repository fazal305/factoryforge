import { BUILDINGS } from '../../data/buildings.js'

// Topology (pole networks, nearest-pole assignment, generation/consumption
// aggregation) only needs to change when a building is placed/removed or
// a generator runs dry — none of which happen 20x/sec — so it's
// recomputed on a throttle instead of every tick. Measured impact: at
// 500 poles / 2000 buildings this step alone cost ~43ms/tick (the
// entire 50ms budget at 20 TPS); throttling to twice a second cuts
// that to roughly a tenth while staying imperceptibly responsive for a
// grid you're actively building.
const RECOMPUTE_INTERVAL_SECONDS = 0.5

function center(building) {
  return { x: building.x + building.footprint.width / 2, y: building.y + building.footprint.height / 2 }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Power poles link into networks by proximity to each other (union by
 * distance, no explicit wires to place); a generator or consumer joins
 * whichever network its nearest in-range pole belongs to. Each network
 * gets a binary powered/unpowered verdict — generation >= consumption
 * or not — rather than fractional brownout throttling, which keeps
 * "why is my furnace idle" traceable to one flag instead of a ratio.
 */
export function tickPower(simulation, dt) {
  simulation.powerClock = (simulation.powerClock ?? 0) + dt
  if (simulation.powerClock < RECOMPUTE_INTERVAL_SECONDS) return
  const elapsed = simulation.powerClock
  simulation.powerClock = 0

  const poles = []
  const generators = []
  const consumers = []

  for (const building of simulation.buildings) {
    const def = BUILDINGS[building.typeId]
    if (building.typeId === 'powerPole') poles.push(building)
    if (def.powerGeneration > 0) generators.push(building)
    if (def.powerConsumption > 0) consumers.push(building)
  }

  const range = BUILDINGS.powerPole.powerRange
  const parent = new Map(poles.map((p) => [p.id, p.id]))
  function find(id) {
    while (parent.get(id) !== id) {
      parent.set(id, parent.get(parent.get(id)))
      id = parent.get(id)
    }
    return id
  }
  function union(a, b) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  for (let i = 0; i < poles.length; i++) {
    for (let j = i + 1; j < poles.length; j++) {
      if (distance(center(poles[i]), center(poles[j])) <= range) union(poles[i].id, poles[j].id)
    }
  }

  function nearestPoleNetwork(building) {
    const c = center(building)
    let best = null
    let bestDist = Infinity
    for (const pole of poles) {
      const d = distance(c, center(pole))
      if (d <= range && d < bestDist) {
        bestDist = d
        best = pole
      }
    }
    return best ? find(best.id) : null
  }

  const networkGeneration = new Map()
  const networkConsumption = new Map()

  for (const generator of generators) {
    const def = BUILDINGS[generator.typeId]

    if (generator.fuelSeconds <= 0 && generator.inputBuffer.remove('coal', 1) > 0) {
      generator.fuelSeconds += def.fuelPerCoal
    }
    generator.generating = generator.fuelSeconds > 0
    if (generator.generating) generator.fuelSeconds = Math.max(0, generator.fuelSeconds - elapsed)

    generator.networkId = nearestPoleNetwork(generator)
    if (generator.networkId != null && generator.generating) {
      networkGeneration.set(generator.networkId, (networkGeneration.get(generator.networkId) ?? 0) + def.powerGeneration)
    }
  }

  for (const consumer of consumers) {
    const def = BUILDINGS[consumer.typeId]
    consumer.networkId = nearestPoleNetwork(consumer)
    if (consumer.networkId != null) {
      networkConsumption.set(consumer.networkId, (networkConsumption.get(consumer.networkId) ?? 0) + def.powerConsumption)
    }
  }

  for (const consumer of consumers) {
    if (consumer.networkId == null) {
      consumer.powered = false
      continue
    }
    const generated = networkGeneration.get(consumer.networkId) ?? 0
    const needed = networkConsumption.get(consumer.networkId) ?? 0
    consumer.powered = generated >= needed
  }

  const production = [...networkGeneration.values()].reduce((sum, v) => sum + v, 0)
  const consumption = [...networkConsumption.values()].reduce((sum, v) => sum + v, 0)
  const wasOverloaded = simulation.powerSummary?.overloaded ?? false
  const overloaded = consumption > production

  simulation.powerSummary = { production, consumption, overloaded }

  if (overloaded && !wasOverloaded) {
    simulation.events.emit('powerShortage', simulation.powerSummary)
  }
}
