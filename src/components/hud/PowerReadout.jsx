import { useCallback } from 'react'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'

export default function PowerReadout() {
  const selectPower = useCallback((engine) => engine.simulation.powerSummary, [])
  const summary = useSimulationSnapshot(selectPower, 400)
  const production = Math.round(summary?.production ?? 0)
  const consumption = Math.round(summary?.consumption ?? 0)
  const overloaded = summary?.overloaded ?? false

  return (
    <div className={`ff-hud__power${overloaded ? ' ff-hud__power--overloaded' : ''}`} title="Power grid">
      <span className="ff-hud__power-icon" aria-hidden="true">
        ⚡
      </span>
      <span className="ff-hud__power-value">
        {consumption} / {production} kW
      </span>
      {overloaded && <span className="ff-hud__power-warning">⚠ OVERLOAD</span>}
    </div>
  )
}
