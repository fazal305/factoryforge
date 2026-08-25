import './PerformanceMonitor.css'

/**
 * Dev-only overlay (import.meta.env.DEV). Entity/active-machine counts
 * join this readout once the building system exists (Step 6) — showing
 * a permanent "0" for them before that would just be a fake metric.
 */
export default function PerformanceMonitor({ stats }) {
  return (
    <div className="ff-perf-monitor" aria-hidden="true">
      <div>FPS {stats.fps}</div>
      <div>TPS {stats.tps}</div>
      <div>Visible tiles {stats.visibleTiles}</div>
    </div>
  )
}
