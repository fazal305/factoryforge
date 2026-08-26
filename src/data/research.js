/**
 * A small linear tech tree. Each node costs a fixed item pack per
 * research "point" and needs a number of points to complete — multiple
 * research stations working the same node each contribute their own
 * points in parallel, same idea as multiple labs in other automation
 * games.
 *
 * Object insertion order is the intended chain order (also used for
 * rendering the panel top-to-bottom).
 */
export const RESEARCH = {
  basicAutomation: {
    id: 'basicAutomation',
    name: 'Basic Automation',
    description: 'Unlocks the assembler and gear production.',
    prerequisites: [],
    cost: { ironPlate: 2 },
    cycleTime: 3,
    pointsRequired: 5,
    unlocks: { buildings: ['assembler'], recipes: ['makeGear'] },
  },
  improvedMining: {
    id: 'improvedMining',
    name: 'Improved Mining',
    description: 'Mining drills extract 50% faster.',
    prerequisites: ['basicAutomation'],
    cost: { ironPlate: 3, gear: 1 },
    cycleTime: 3,
    pointsRequired: 6,
    unlocks: { upgrades: ['miningSpeedBoost'] },
  },
  advancedLogistics: {
    id: 'advancedLogistics',
    name: 'Advanced Logistics',
    description: 'Unlocks underground conveyors for routing belts beneath obstacles.',
    prerequisites: ['improvedMining'],
    cost: { ironPlate: 4, steel: 1 },
    cycleTime: 4,
    pointsRequired: 6,
    unlocks: { buildings: ['undergroundConveyor'] },
  },
  electronics: {
    id: 'electronics',
    name: 'Electronics',
    description: 'Unlocks circuit production.',
    prerequisites: ['advancedLogistics'],
    cost: { copperPlate: 3 },
    cycleTime: 4,
    pointsRequired: 6,
    unlocks: { recipes: ['makeCircuit'] },
  },
  advancedManufacturing: {
    id: 'advancedManufacturing',
    name: 'Advanced Manufacturing',
    description: 'Unlocks steel smelting and machine parts assembly.',
    prerequisites: ['electronics'],
    cost: { circuit: 2, gear: 2 },
    cycleTime: 5,
    pointsRequired: 8,
    unlocks: { recipes: ['smeltSteel', 'makeMachineParts'] },
  },
}

export const RESEARCH_LIST = Object.values(RESEARCH)

const BUILDING_UNLOCK_REQUIREMENT = {
  assembler: 'basicAutomation',
  undergroundConveyor: 'advancedLogistics',
}

const RECIPE_UNLOCK_REQUIREMENT = {
  makeGear: 'basicAutomation',
  makeCircuit: 'electronics',
  smeltSteel: 'advancedManufacturing',
  makeMachineParts: 'advancedManufacturing',
}

export const MINING_SPEED_BOOST_MULTIPLIER = 1.5

export function isBuildingUnlocked(typeId, completedResearch) {
  const req = BUILDING_UNLOCK_REQUIREMENT[typeId]
  return !req || completedResearch.has(req)
}

export function isRecipeUnlocked(recipeId, completedResearch) {
  const req = RECIPE_UNLOCK_REQUIREMENT[recipeId]
  return !req || completedResearch.has(req)
}

export function buildingUnlockRequirement(typeId) {
  const req = BUILDING_UNLOCK_REQUIREMENT[typeId]
  return req ? RESEARCH[req] : null
}

export function recipeUnlockRequirement(recipeId) {
  const req = RECIPE_UNLOCK_REQUIREMENT[recipeId]
  return req ? RESEARCH[req] : null
}

export function isResearchAvailable(nodeId, completedResearch) {
  const node = RESEARCH[nodeId]
  return node.prerequisites.every((p) => completedResearch.has(p))
}
