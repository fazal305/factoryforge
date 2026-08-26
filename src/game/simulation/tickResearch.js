import { RESEARCH } from '../../data/research.js'

/**
 * Every research station working the active node contributes its own
 * points in parallel (each pays the node's item cost and runs its own
 * cycleTime independently) — more stations means faster research, same
 * idea as running multiple labs. Progress is tracked per node on the
 * simulation, not per station, so switching the active node doesn't
 * discard a station's completed points, and resuming a node later
 * picks up where it left off.
 */
export function tickResearch(simulation, dt) {
  const nodeId = simulation.activeResearchId
  const node = nodeId ? RESEARCH[nodeId] : null

  if (!node || simulation.completedResearch.has(nodeId)) {
    simulation.activeResearchId = null
    return
  }

  for (const building of simulation.buildings) {
    if (building.typeId !== 'researchStation') continue

    if (!building.powered) {
      building.status = 'unpowered'
      continue
    }

    if (!building.researching) {
      const hasCost = Object.entries(node.cost).every(([resourceId, qty]) => building.inputBuffer.has(resourceId, qty))
      if (!hasCost) {
        building.status = 'starved'
        continue
      }

      for (const [resourceId, qty] of Object.entries(node.cost)) {
        building.inputBuffer.remove(resourceId, qty)
      }
      building.researching = true
      building.progress = 0
      building.status = 'running'
    }

    building.progress += dt
    if (building.progress < node.cycleTime) continue

    building.progress = 0
    building.researching = false

    const points = (simulation.researchProgressByNode.get(nodeId) ?? 0) + 1
    simulation.researchProgressByNode.set(nodeId, points)

    if (points >= node.pointsRequired) {
      simulation.completedResearch.add(nodeId)
      simulation.activeResearchId = null
      simulation.events.emit('researchCompleted', node)
      break
    }
  }
}
