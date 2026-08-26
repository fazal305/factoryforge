const SAMPLE_INTERVAL_SECONDS = 1
const HISTORY_LENGTH = 60 // 60 samples at 1s each = a 60s rolling window

/**
 * Samples cumulative production once a second into a rolling history —
 * that's what lets computeRatePerMinute derive a real "items/min" rate
 * instead of guessing from a single tick's dt. The cumulative counters
 * themselves are updated by event listeners (see GameCanvas's
 * 'itemProduced'/'itemConsumed' subscriptions), not by this system;
 * this only handles the periodic snapshot.
 */
export function tickStatsSampler(simulation, dt) {
  const stats = simulation.stats
  stats.elapsedSeconds += dt
  stats.sampleClock += dt
  if (stats.sampleClock < SAMPLE_INTERVAL_SECONDS) return
  stats.sampleClock = 0

  stats.history.push({ t: stats.elapsedSeconds, produced: new Map(stats.itemsProduced) })
  if (stats.history.length > HISTORY_LENGTH) stats.history.shift()
}

/** Items/minute for one resource, from the oldest to newest sample in history. */
export function computeRatePerMinute(history, resourceId) {
  if (history.length < 2) return 0
  const oldest = history[0]
  const latest = history[history.length - 1]
  const deltaTime = latest.t - oldest.t
  if (deltaTime <= 0) return 0
  const deltaCount = (latest.produced.get(resourceId) ?? 0) - (oldest.produced.get(resourceId) ?? 0)
  return (deltaCount / deltaTime) * 60
}
