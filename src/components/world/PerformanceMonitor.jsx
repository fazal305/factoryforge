import './PerformanceMonitor.css'

/**
 * Dev-only overlay (import.meta.env.DEV). Simulation TPS and active-machine
 * counts join this readout once the simulation engine exists (Step 5).
 */
export default function PerformanceMonitor({ stats }) {
  return (
    <div className="ff-perf-monitor" aria-hidden="true">
      <div>FPS {stats.fps}</div>
      <div>Visible tiles {stats.visibleTiles}</div>
    </div>
  )
}
