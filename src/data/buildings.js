/**
 * Building catalog. UI (toolbar, build menu, tooltips) and the placement
 * system both read from this table — building behavior/stats should not
 * be duplicated or hardcoded in components.
 *
 * Full stat fields (power, speed, recipe compatibility, footprint
 * collision rules) are filled in during the building-system step; this
 * initial pass provides enough shape for the toolbar and inspector UI.
 */

export const BUILD_CATEGORY = {
  MINING: 'mining',
  LOGISTICS: 'logistics',
  PRODUCTION: 'production',
  POWER: 'power',
  STORAGE: 'storage',
}

export const BUILD_CATEGORY_LABEL = {
  [BUILD_CATEGORY.MINING]: 'Mining',
  [BUILD_CATEGORY.LOGISTICS]: 'Logistics',
  [BUILD_CATEGORY.PRODUCTION]: 'Production',
  [BUILD_CATEGORY.POWER]: 'Power',
  [BUILD_CATEGORY.STORAGE]: 'Storage',
}

export const BUILDINGS = {
  miningDrill: {
    id: 'miningDrill',
    name: 'Mining Drill',
    category: BUILD_CATEGORY.MINING,
    footprint: { width: 2, height: 2 },
    cost: { ironPlate: 6, gear: 2 },
    description: 'Extracts ore from a resource deposit beneath it.',
  },
  furnace: {
    id: 'furnace',
    name: 'Furnace',
    category: BUILD_CATEGORY.PRODUCTION,
    footprint: { width: 2, height: 2 },
    cost: { stone: 10 },
    description: 'Smelts raw ore into plates.',
  },
  assembler: {
    id: 'assembler',
    name: 'Assembler',
    category: BUILD_CATEGORY.PRODUCTION,
    footprint: { width: 3, height: 3 },
    cost: { ironPlate: 12, gear: 6, circuit: 4 },
    description: 'Combines inputs into higher-tier products via a recipe.',
  },
  conveyor: {
    id: 'conveyor',
    name: 'Conveyor Belt',
    category: BUILD_CATEGORY.LOGISTICS,
    footprint: { width: 1, height: 1 },
    cost: { ironPlate: 1 },
    description: 'Moves items between machines.',
  },
  undergroundConveyor: {
    id: 'undergroundConveyor',
    name: 'Underground Conveyor',
    category: BUILD_CATEGORY.LOGISTICS,
    footprint: { width: 1, height: 1 },
    cost: { ironPlate: 4, steel: 1 },
    description: 'Routes items beneath obstacles or other belts.',
  },
  inserter: {
    id: 'inserter',
    name: 'Inserter',
    category: BUILD_CATEGORY.LOGISTICS,
    footprint: { width: 1, height: 1 },
    cost: { ironPlate: 2, gear: 1 },
    description: 'Moves items between a belt and a machine slot.',
  },
  storageChest: {
    id: 'storageChest',
    name: 'Storage Chest',
    category: BUILD_CATEGORY.STORAGE,
    footprint: { width: 1, height: 1 },
    cost: { ironPlate: 8 },
    description: 'Buffers items with a large stack capacity.',
  },
  powerGenerator: {
    id: 'powerGenerator',
    name: 'Power Generator',
    category: BUILD_CATEGORY.POWER,
    footprint: { width: 2, height: 3 },
    cost: { ironPlate: 10, copperPlate: 6 },
    description: 'Burns coal to produce electricity for the grid.',
  },
  powerPole: {
    id: 'powerPole',
    name: 'Power Pole',
    category: BUILD_CATEGORY.POWER,
    footprint: { width: 1, height: 1 },
    cost: { copperPlate: 2, ironPlate: 1 },
    description: 'Extends grid coverage to nearby buildings.',
  },
  researchStation: {
    id: 'researchStation',
    name: 'Research Station',
    category: BUILD_CATEGORY.PRODUCTION,
    footprint: { width: 3, height: 3 },
    cost: { ironPlate: 20, circuit: 10, gear: 8 },
    description: 'Consumes research materials to unlock upgrades.',
  },
}

export const BUILDING_LIST = Object.values(BUILDINGS)

export function buildingsByCategory(category) {
  return BUILDING_LIST.filter((b) => b.category === category)
}
