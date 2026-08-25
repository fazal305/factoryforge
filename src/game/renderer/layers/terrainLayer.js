import { worldToScreen } from '../camera.js'
import { TILE_HEIGHT, TILE_WIDTH } from '../isoProjection.js'
import { TERRAIN } from '../../world/WorldGrid.js'

const TERRAIN_COLOR = {
  [TERRAIN.GRASS]: '#3c5a3f',
  [TERRAIN.WATER]: '#2a5a78',
  [TERRAIN.STONE]: '#5c5e63',
  [TERRAIN.SAND]: '#8a7a53',
}

const TERRAIN_COLOR_ALT = {
  [TERRAIN.GRASS]: '#436642',
  [TERRAIN.WATER]: '#2f6483',
  [TERRAIN.STONE]: '#65676c',
  [TERRAIN.SAND]: '#93835a',
}

function drawDiamond(ctx, cx, cy, halfW, halfH) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - halfH)
  ctx.lineTo(cx + halfW, cy)
  ctx.lineTo(cx, cy + halfH)
  ctx.lineTo(cx - halfW, cy)
  ctx.closePath()
}

export function drawTerrainLayer(ctx, world, camera, canvasWidth, canvasHeight, range) {
  const halfW = (TILE_WIDTH / 2) * camera.zoom
  const halfH = (TILE_HEIGHT / 2) * camera.zoom

  for (let y = range.minY; y <= range.maxY; y++) {
    for (let x = range.minX; x <= range.maxX; x++) {
      const terrain = world.getTerrain(x, y)
      const checker = (x + y) % 2 === 0
      ctx.fillStyle = checker ? TERRAIN_COLOR[terrain] : TERRAIN_COLOR_ALT[terrain]

      const { x: sx, y: sy } = worldToScreen(camera, canvasWidth, canvasHeight, x, y)
      drawDiamond(ctx, sx, sy, halfW, halfH)
      ctx.fill()
    }
  }
}
