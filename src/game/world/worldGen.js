import { DEPOSIT, TERRAIN, WorldGrid } from './WorldGrid.js'

/** Deterministic 32-bit PRNG (mulberry32) so a seed reproduces a world. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Cheap hash-based value noise — avoids pulling in a noise library. */
function hash2D(x, y, seed) {
  let n = x * 374761393 + y * 668265263 + seed * 2147483647
  n = (n ^ (n >> 13)) * 1274126177
  n = n ^ (n >> 16)
  return ((n >>> 0) % 100000) / 100000
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function valueNoise2D(x, y, seed) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1
  const sx = smoothstep(x - x0)
  const sy = smoothstep(y - y0)

  const n00 = hash2D(x0, y0, seed)
  const n10 = hash2D(x1, y0, seed)
  const n01 = hash2D(x0, y1, seed)
  const n11 = hash2D(x1, y1, seed)

  const ix0 = n00 + (n10 - n00) * sx
  const ix1 = n01 + (n11 - n01) * sx
  return ix0 + (ix1 - ix0) * sy
}

function fbm(x, y, seed, octaves = 4) {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  let max = 0
  for (let o = 0; o < octaves; o++) {
    value += valueNoise2D(x * frequency, y * frequency, seed + o * 101) * amplitude
    max += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return value / max
}

const DEPOSIT_CLUSTERS = [
  { type: DEPOSIT.IRON_ORE, count: 6, radius: 4, minAmount: 400, maxAmount: 900 },
  { type: DEPOSIT.COPPER_ORE, count: 5, radius: 4, minAmount: 400, maxAmount: 900 },
  { type: DEPOSIT.COAL, count: 5, radius: 3, minAmount: 300, maxAmount: 700 },
  { type: DEPOSIT.STONE, count: 4, radius: 3, minAmount: 300, maxAmount: 700 },
]

/**
 * Generates a terrain + resource-deposit world. Runs inside
 * workers/worldGen.worker.js off the main thread; kept as a pure
 * function here so it stays independently testable.
 */
export function generateWorld(width, height, seed = 1) {
  const grid = new WorldGrid(width, height)
  const random = mulberry32(seed)
  const scale = 0.08

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = fbm(x * scale, y * scale, seed)
      const i = grid.index(x, y)

      let terrain
      if (elevation < 0.32) terrain = TERRAIN.WATER
      else if (elevation < 0.38) terrain = TERRAIN.SAND
      else if (elevation > 0.68) terrain = TERRAIN.STONE
      else terrain = TERRAIN.GRASS

      grid.terrain[i] = terrain
    }
  }

  for (const cluster of DEPOSIT_CLUSTERS) {
    for (let c = 0; c < cluster.count; c++) {
      const cx = Math.floor(random() * width)
      const cy = Math.floor(random() * height)
      if (grid.getTerrain(cx, cy) === TERRAIN.WATER) continue

      const clusterAmount = Math.floor(cluster.minAmount + random() * (cluster.maxAmount - cluster.minAmount))
      const r = cluster.radius
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx
          const y = cy + dy
          if (!grid.inBounds(x, y)) continue
          if (dx * dx + dy * dy > r * r) continue
          if (grid.getTerrain(x, y) === TERRAIN.WATER) continue

          const i = grid.index(x, y)
          if (grid.deposit[i] !== DEPOSIT.NONE) continue

          grid.deposit[i] = cluster.type
          grid.depositAmount[i] = clusterAmount
        }
      }
    }
  }

  return grid
}
