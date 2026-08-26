import { BUILDINGS, BUILD_CATEGORY } from '../../data/buildings.js'
import { RESOURCES } from '../../data/resources.js'
import { RECIPES } from '../../data/recipes.js'
import { BELT_TYPES, ITEM_SPACING } from '../simulation/constants.js'

const DETECTION_INTERVAL_SECONDS = 2
const BELT_SATURATION_THRESHOLD = Math.floor(1 / ITEM_SPACING)

function label(def, building) {
  return `${def.name} #${building.id}`
}

function describeStarved(building) {
  const recipe = RECIPES[building.recipeId]
  const missing = Object.keys(recipe.input)
    .filter((resourceId) => !building.inputBuffer.has(resourceId, recipe.input[resourceId]))
    .map((resourceId) => RESOURCES[resourceId].name)
  return {
    issue: `Waiting for ${missing.join(', ')}`,
    suggestion: 'Increase mining/production capacity or conveyor throughput feeding this machine.',
  }
}

/**
 * Recomputes the full bottleneck list every couple of seconds — cheap
 * enough at this scale, and the throttle keeps the list from
 * flickering as buildings toggle status tick-to-tick. Replaces
 * simulation.bottlenecks wholesale; this is a snapshot of current
 * problems, not an accumulating log.
 */
export function tickBottleneckDetector(simulation, dt) {
  simulation.bottleneckClock += dt
  if (simulation.bottleneckClock < DETECTION_INTERVAL_SECONDS) return
  simulation.bottleneckClock = 0

  const bottlenecks = []

  if (simulation.powerSummary.overloaded) {
    bottlenecks.push({
      id: 'power-grid',
      title: 'Power Grid',
      issue: `Overloaded — ${Math.round(simulation.powerSummary.consumption)} kW needed, ${Math.round(simulation.powerSummary.production)} kW available`,
      suggestion: 'Build more generators, or reduce the number of powered machines.',
    })
  }

  for (const building of simulation.buildings) {
    const def = BUILDINGS[building.typeId]

    if (building.recipeId !== undefined && building.recipeId) {
      if (building.status === 'starved') {
        bottlenecks.push({ id: building.id, title: label(def, building), ...describeStarved(building) })
      } else if (building.status === 'blocked') {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: 'Output full — nothing is removing its product',
          suggestion: 'Add a conveyor and inserter (or storage) to clear its output.',
        })
      } else if (building.status === 'unpowered') {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: 'Unpowered',
          suggestion: 'Connect it to a power pole within range of a generator with enough supply.',
        })
      }
    }

    if (def.category === BUILD_CATEGORY.MINING) {
      if (building.depositTileIndex === null) {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: 'No resource deposit — nothing to mine',
          suggestion: 'Relocate this drill onto an active resource deposit.',
        })
      } else if (!building.powered) {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: 'Unpowered',
          suggestion: 'Connect it to a power pole within range of a generator with enough supply.',
        })
      } else if (!building.outputBuffer.canAdd(building.depositResourceId, 1)) {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: 'Output buffer full — ore is backing up',
          suggestion: 'Add a conveyor and inserter to move ore away from this drill.',
        })
      }
    }

    if (def.category === BUILD_CATEGORY.STORAGE) {
      const full = [...building.inputBuffer.entries()].find(([resourceId]) => !building.inputBuffer.canAdd(resourceId, 1))
      if (full) {
        bottlenecks.push({
          id: building.id,
          title: label(def, building),
          issue: `Full of ${RESOURCES[full[0]].name}`,
          suggestion: 'Add more storage capacity or consume this resource elsewhere.',
        })
      }
    }

    if (BELT_TYPES.has(building.typeId) && building.items.length >= BELT_SATURATION_THRESHOLD) {
      bottlenecks.push({
        id: building.id,
        title: label(def, building),
        issue: 'Belt saturated with items',
        suggestion: 'Add a parallel belt, or speed up whatever is downstream.',
      })
    }
  }

  simulation.bottlenecks = bottlenecks
}
