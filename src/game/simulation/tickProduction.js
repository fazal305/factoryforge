import { RECIPES } from '../../data/recipes.js'

/**
 * Furnace/assembler recipe processing. Inputs are consumed all at once
 * when a cycle starts (not trickled in over the cycle) so a recipe
 * that's mid-cycle can't be interrupted by another consumer draining
 * its inputs — once started, a cycle always finishes. Status reflects
 * *why* a building isn't producing (starved vs. blocked) so the
 * bottleneck system (Step 13) has something concrete to point at.
 */
export function tickProduction(simulation, dt) {
  for (const building of simulation.buildings) {
    if (building.recipeId === undefined) continue // not a recipe-capable building

    if (!building.recipeId) {
      building.status = 'idle'
      continue
    }

    if (!building.powered) {
      building.status = 'unpowered'
      continue
    }

    const recipe = RECIPES[building.recipeId]

    if (!building.processing) {
      const inputsReady = Object.entries(recipe.input).every(([resourceId, qty]) =>
        building.inputBuffer.has(resourceId, qty),
      )
      if (!inputsReady) {
        building.status = 'starved'
        continue
      }

      const outputsHaveRoom = Object.entries(recipe.output).every(([resourceId, qty]) =>
        building.outputBuffer.canAdd(resourceId, qty),
      )
      if (!outputsHaveRoom) {
        building.status = 'blocked'
        continue
      }

      for (const [resourceId, qty] of Object.entries(recipe.input)) {
        building.inputBuffer.remove(resourceId, qty)
      }
      building.processing = true
      building.progress = 0
      building.status = 'running'
    }

    building.progress += dt
    if (building.progress >= recipe.time) {
      for (const [resourceId, qty] of Object.entries(recipe.output)) {
        building.outputBuffer.add(resourceId, qty)
      }
      building.processing = false
      building.progress = 0
    }
  }
}
