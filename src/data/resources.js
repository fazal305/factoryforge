/**
 * Central resource definitions. Every raw and processed material in the
 * game is declared here — nothing else should hardcode a resource name,
 * color, or category.
 */

export const RESOURCE_CATEGORY = {
  RAW: 'raw',
  PROCESSED: 'processed',
}

export const RESOURCES = {
  ironOre: {
    id: 'ironOre',
    name: 'Iron Ore',
    category: RESOURCE_CATEGORY.RAW,
    color: 'var(--ff-color-resource-iron)',
    stackLimit: 100,
  },
  copperOre: {
    id: 'copperOre',
    name: 'Copper Ore',
    category: RESOURCE_CATEGORY.RAW,
    color: 'var(--ff-color-resource-copper)',
    stackLimit: 100,
  },
  coal: {
    id: 'coal',
    name: 'Coal',
    category: RESOURCE_CATEGORY.RAW,
    color: 'var(--ff-color-resource-coal)',
    stackLimit: 100,
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    category: RESOURCE_CATEGORY.RAW,
    color: 'var(--ff-color-resource-stone)',
    stackLimit: 100,
  },
  water: {
    id: 'water',
    name: 'Water',
    category: RESOURCE_CATEGORY.RAW,
    color: 'var(--ff-color-resource-water)',
    stackLimit: 100,
  },
  ironPlate: {
    id: 'ironPlate',
    name: 'Iron Plate',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-iron)',
    stackLimit: 100,
  },
  copperPlate: {
    id: 'copperPlate',
    name: 'Copper Plate',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-copper)',
    stackLimit: 100,
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-steel)',
    stackLimit: 100,
  },
  gear: {
    id: 'gear',
    name: 'Gear',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-steel)',
    stackLimit: 100,
  },
  circuit: {
    id: 'circuit',
    name: 'Circuit',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-circuit)',
    stackLimit: 100,
  },
  machineParts: {
    id: 'machineParts',
    name: 'Machine Parts',
    category: RESOURCE_CATEGORY.PROCESSED,
    color: 'var(--ff-color-resource-steel)',
    stackLimit: 50,
  },
}

export const RESOURCE_LIST = Object.values(RESOURCES)
