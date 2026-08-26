import { useCallback } from 'react'
import { useUiStore } from '../../state/uiStore'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'
import { computeRatePerMinute } from '../../game/systems/statsAggregator.js'
import { RESOURCES, RESOURCE_LIST } from '../../data/resources'
import Panel from '../common/Panel'
import './StatsPanel.css'

function RateChart({ rates }) {
  if (rates.length === 0) {
    return <p className="ff-stats__empty">No production yet — place and power up some machines.</p>
  }
  const max = Math.max(...rates.map(([, rate]) => rate))
  return (
    <div className="ff-stats__chart">
      {rates.map(([resourceId, rate]) => (
        <div key={resourceId} className="ff-stats__bar-row">
          <span className="ff-stats__bar-label">{RESOURCES[resourceId].name}</span>
          <div className="ff-stats__bar-track">
            <div
              className="ff-stats__bar-fill"
              style={{ width: `${(rate / max) * 100}%`, background: RESOURCES[resourceId].color }}
            />
          </div>
          <span className="ff-stats__bar-value">{rate.toFixed(1)}/min</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsPanel() {
  const closePanel = useUiStore((s) => s.closePanel)
  const selectStats = useCallback((engine) => {
    const sim = engine.simulation
    const recipeBuildings = sim.buildings.filter((b) => b.recipeId !== undefined)
    const runningCount = recipeBuildings.filter((b) => b.status === 'running').length

    const rates = RESOURCE_LIST.map((r) => [r.id, computeRatePerMinute(sim.stats.history, r.id)]).filter(
      ([, rate]) => rate > 0.01,
    )

    return {
      power: sim.powerSummary,
      bottlenecks: sim.bottlenecks,
      utilization: recipeBuildings.length > 0 ? runningCount / recipeBuildings.length : null,
      machineCount: recipeBuildings.length,
      runningCount,
      rates,
      totalProduced: [...sim.stats.itemsProduced.entries()].filter(([, qty]) => qty > 0),
    }
  }, [])
  const stats = useSimulationSnapshot(selectStats, 500)

  if (!stats) {
    return (
      <Panel title="Statistics" onClose={closePanel} className="ff-side-panel">
        <p className="ff-stats__empty">Loading…</p>
      </Panel>
    )
  }

  return (
    <Panel title="Statistics" onClose={closePanel} className="ff-side-panel ff-stats-panel">
      <div className="ff-stats">
        <section>
          <h3 className="ff-stats__heading">Production rate</h3>
          <RateChart rates={stats.rates} />
        </section>

        <section>
          <h3 className="ff-stats__heading">Machine utilization</h3>
          {stats.machineCount === 0 ? (
            <p className="ff-stats__empty">No production machines placed yet.</p>
          ) : (
            <div className="ff-stats__utilization">
              <div className="ff-stats__bar-track">
                <div className="ff-stats__bar-fill ff-stats__bar-fill--accent" style={{ width: `${stats.utilization * 100}%` }} />
              </div>
              <span>
                {stats.runningCount}/{stats.machineCount} running ({Math.round(stats.utilization * 100)}%)
              </span>
            </div>
          )}
        </section>

        <section>
          <h3 className="ff-stats__heading">Power</h3>
          <p className="ff-stats__power">
            {Math.round(stats.power.consumption)} / {Math.round(stats.power.production)} kW
            {stats.power.overloaded && <span className="ff-stats__overload"> ⚠ Overload</span>}
          </p>
        </section>

        <section>
          <h3 className="ff-stats__heading">Bottlenecks</h3>
          {stats.bottlenecks.length === 0 ? (
            <p className="ff-stats__empty">No bottlenecks detected.</p>
          ) : (
            <ul className="ff-stats__bottlenecks">
              {stats.bottlenecks.map((b) => (
                <li key={b.id} className="ff-stats__bottleneck">
                  <div className="ff-stats__bottleneck-header">⚠ BOTTLENECK DETECTED</div>
                  <div className="ff-stats__bottleneck-title">{b.title}</div>
                  <div className="ff-stats__bottleneck-issue">{b.issue}</div>
                  <div className="ff-stats__bottleneck-suggestion">Suggested action: {b.suggestion}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="ff-stats__heading">Lifetime production</h3>
          {stats.totalProduced.length === 0 ? (
            <p className="ff-stats__empty">Nothing produced yet.</p>
          ) : (
            <ul className="ff-stats__total-list">
              {stats.totalProduced.map(([resourceId, qty]) => (
                <li key={resourceId}>
                  <span className="ff-hud__resource-swatch" style={{ background: RESOURCES[resourceId].color }} />
                  {RESOURCES[resourceId].name}: {qty}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Panel>
  )
}
