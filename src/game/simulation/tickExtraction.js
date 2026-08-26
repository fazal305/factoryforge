import { BUILDINGS, BUILD_CATEGORY } from '../../data/buildings.js'
import { MINING_SPEED_BOOST_MULTIPLIER } from '../../data/research.js'

/**
 * Mining drills accumulate fractional progress at their def's
 * miningSpeed (items/sec) and pull whole units from the world's
 * deposit-amount grid into their own output buffer — depleting the
 * deposit as they go. A drill with no deposit under its footprint, or
 * a depleted one, simply produces nothing; nothing else needs to know
 * why.
 */
export function tickExtraction(simulation, dt) {
  const world = simulation.world

  for (const building of simulation.buildings) {
    const def = BUILDINGS[building.typeId]
    if (def.category !== BUILD_CATEGORY.MINING) continue
    if (!building.powered) continue
    if (building.depositTileIndex === null) continue

    const remaining = world.depositAmount[building.depositTileIndex]
    if (remaining <= 0) {
      building.depositTileIndex = null
      building.depositResourceId = null
      continue
    }

    const space = building.outputBuffer.spaceFor(building.depositResourceId)
    if (space <= 0) continue

    const speedMultiplier = simulation.completedResearch.has('improvedMining') ? MINING_SPEED_BOOST_MULTIPLIER : 1
    building.progress += dt * def.miningSpeed * speedMultiplier
    if (building.progress < 1) continue

    const whole = Math.floor(building.progress)
    building.progress -= whole

    const extracted = Math.min(whole, remaining)
    if (extracted <= 0) continue

    const added = building.outputBuffer.add(building.depositResourceId, extracted)
    world.depositAmount[building.depositTileIndex] -= added
  }
}
