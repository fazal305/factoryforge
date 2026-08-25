import { useEffect, useState } from 'react'
import { getEngineInstance } from '../game/engine/engineInstance.js'

/**
 * Throttled bridge from the engine's mutable, per-tick simulation state
 * into React. Polls at intervalMs instead of subscribing per-tick —
 * HUD numbers don't need to update 20x/sec, and a per-tick subscription
 * would re-render on every simulation step.
 */
export function useSimulationSnapshot(selector, intervalMs = 250) {
  const [snapshot, setSnapshot] = useState(() => {
    const engine = getEngineInstance()
    return engine ? selector(engine) : null
  })

  useEffect(() => {
    const id = setInterval(() => {
      const engine = getEngineInstance()
      if (!engine) return
      setSnapshot(selector(engine))
    }, intervalMs)
    return () => clearInterval(id)
  }, [selector, intervalMs])

  return snapshot
}
