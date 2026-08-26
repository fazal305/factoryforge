import './PerformanceMonitor.css'

/** Dev-only overlay (import.meta.env.DEV). */
export default function PerformanceMonitor({ stats }) {
  return (
    <div className="ff-perf-monitor" aria-hidden="true">
      <div>FPS {stats.fps}</div>
      <div>TPS {stats.tps}</div>
      <div>Visible tiles {stats.visibleTiles}</div>
      <div>Entities {stats.entities}</div>
      <div>Active machines {stats.activeMachines}</div>
    </div>
  )
}
