/**
 * Module-level handle to the live { simulation, gameLoop } pair.
 * GameCanvas owns creation/teardown; anything else (HUD readouts,
 * dev tools) reaches the engine through this instead of prop-drilling
 * refs down from the canvas. There is only ever one running world, so
 * a singleton is simpler than context here.
 */
let instance = null

export function setEngineInstance(next) {
  instance = next
}

export function getEngineInstance() {
  return instance
}
