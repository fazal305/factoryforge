import { generateWorld } from '../game/world/worldGen.js'

self.onmessage = (event) => {
  const { width, height, seed } = event.data
  const grid = generateWorld(width, height, seed)
  const payload = grid.toTransferable()

  self.postMessage(payload, [
    payload.terrain,
    payload.deposit,
    payload.depositAmount,
    payload.buildingId,
  ])
}
