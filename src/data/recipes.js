/**
 * Recipe catalog. Each recipe names the building type that can run it,
 * its inputs/outputs (resource id -> quantity), and how long one cycle
 * takes in simulated seconds. The production system (Step 7) and the
 * Inspector's recipe picker both read this table — nothing about a
 * recipe is hardcoded into a building's behavior.
 */

export const RECIPES = {
  smeltIronPlate: {
    id: 'smeltIronPlate',
    name: 'Iron Plate',
    building: 'furnace',
    input: { ironOre: 1 },
    output: { ironPlate: 1 },
    time: 3,
  },
  smeltCopperPlate: {
    id: 'smeltCopperPlate',
    name: 'Copper Plate',
    building: 'furnace',
    input: { copperOre: 1 },
    output: { copperPlate: 1 },
    time: 3,
  },
  smeltSteel: {
    id: 'smeltSteel',
    name: 'Steel',
    building: 'furnace',
    input: { ironPlate: 2 },
    output: { steel: 1 },
    time: 5,
  },
  makeGear: {
    id: 'makeGear',
    name: 'Gear',
    building: 'assembler',
    input: { ironPlate: 2 },
    output: { gear: 1 },
    time: 2,
  },
  makeCircuit: {
    id: 'makeCircuit',
    name: 'Circuit',
    building: 'assembler',
    input: { copperPlate: 2 },
    output: { circuit: 1 },
    time: 2,
  },
  makeMachineParts: {
    id: 'makeMachineParts',
    name: 'Machine Parts',
    building: 'assembler',
    input: { ironPlate: 2, gear: 2, circuit: 1 },
    output: { machineParts: 1 },
    time: 4,
  },
}

export const RECIPE_LIST = Object.values(RECIPES)

export function recipesForBuilding(buildingTypeId) {
  return RECIPE_LIST.filter((r) => r.building === buildingTypeId)
}
