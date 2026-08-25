/** Ticks per second of simulated time at 1x speed. */
export const TICK_RATE = 20
export const FIXED_DT = 1 / TICK_RATE

// Caps how many ticks one frame can catch up on. Without this, a
// backgrounded tab (or a debugger pause) resuming after minutes would
// try to replay thousands of ticks in one frame — the "spiral of
// death" fixed-timestep loops are prone to. Simulated time simply
// falls behind wall-clock time instead of freezing the tab.
const MAX_TICKS_PER_FRAME = 8

/**
 * Fixed-timestep accumulator loop. Owns simulated time; does not touch
 * requestAnimationFrame itself — the caller (GameCanvas's render loop)
 * calls advance(now) once per animation frame and this decides how many
 * (if any) fixed-size simulation ticks have elapsed since last call.
 *
 * This is what keeps production math independent of frame rate and of
 * simulation speed: every tick always advances the world by exactly
 * FIXED_DT of simulated time. Speed changes how many ticks run per
 * real second, never how much a single tick does.
 */
export class GameLoop {
  constructor({ onTick }) {
    this.onTick = onTick
    this.paused = false
    this.speed = 1
    this.accumulator = 0
    this.lastTime = null
    this.tickCount = 0
    this.simTimeSeconds = 0
  }

  setPaused(paused) {
    this.paused = paused
  }

  setSpeed(speed) {
    this.speed = speed
  }

  /** Call once per animation frame. Returns the number of ticks executed. */
  advance(now) {
    if (this.lastTime === null) {
      this.lastTime = now
      return 0
    }

    let realDt = (now - this.lastTime) / 1000
    this.lastTime = now
    if (realDt > 0.25) realDt = 0.25
    if (this.paused) return 0

    this.accumulator += realDt * this.speed

    let ticks = 0
    while (this.accumulator >= FIXED_DT && ticks < MAX_TICKS_PER_FRAME) {
      this.onTick(FIXED_DT, this.tickCount)
      this.tickCount++
      this.simTimeSeconds += FIXED_DT
      this.accumulator -= FIXED_DT
      ticks++
    }

    return ticks
  }
}
