export const TERRAIN = {
  GRASS: 0,
  WATER: 1,
  STONE: 2,
  SAND: 3,
}

// Deposit ids stored in the resource layer. 0 means "no deposit".
// Indices line up with data/resources.js raw resource ids.
export const DEPOSIT = {
  NONE: 0,
  IRON_ORE: 1,
  COPPER_ORE: 2,
  COAL: 3,
  STONE: 4,
}

export const DEPOSIT_RESOURCE_ID = {
  [DEPOSIT.IRON_ORE]: 'ironOre',
  [DEPOSIT.COPPER_ORE]: 'copperOre',
  [DEPOSIT.COAL]: 'coal',
  [DEPOSIT.STONE]: 'stone',
}

/**
 * Flat, struct-of-arrays representation of the world. Every layer is a
 * typed array of length width*height so the renderer and (later) the
 * simulation can scan/mutate tiles without allocating per-tile objects.
 *
 * buildingId stays -1 until the building system (Step 6) starts writing
 * to it; it is declared now so the grid shape doesn't change later.
 */
export class WorldGrid {
  constructor(width, height, buffers) {
    this.width = width
    this.height = height
    const size = width * height

    this.terrain = buffers?.terrain ?? new Uint8Array(size)
    this.deposit = buffers?.deposit ?? new Uint8Array(size)
    this.depositAmount = buffers?.depositAmount ?? new Uint16Array(size)
    this.buildingId = buffers?.buildingId ?? new Int16Array(size).fill(-1)
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  index(x, y) {
    return y * this.width + x
  }

  getTerrain(x, y) {
    return this.terrain[this.index(x, y)]
  }

  getDeposit(x, y) {
    const i = this.index(x, y)
    const id = this.deposit[i]
    return id === DEPOSIT.NONE ? null : { type: id, amount: this.depositAmount[i] }
  }

  isBuildable(x, y) {
    if (!this.inBounds(x, y)) return false
    const i = this.index(x, y)
    return this.terrain[i] !== TERRAIN.WATER && this.buildingId[i] === -1
  }

  /** Serializes to transferable ArrayBuffers for worker postMessage. */
  toTransferable() {
    return {
      width: this.width,
      height: this.height,
      terrain: this.terrain.buffer,
      deposit: this.deposit.buffer,
      depositAmount: this.depositAmount.buffer,
      buildingId: this.buildingId.buffer,
    }
  }

  static fromTransferable(payload) {
    return new WorldGrid(payload.width, payload.height, {
      terrain: new Uint8Array(payload.terrain),
      deposit: new Uint8Array(payload.deposit),
      depositAmount: new Uint16Array(payload.depositAmount),
      buildingId: new Int16Array(payload.buildingId),
    })
  }
}
