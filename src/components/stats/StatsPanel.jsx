import { useUiStore } from '../../state/uiStore'
import Panel from '../common/Panel'

/**
 * Placeholder shell — real production/consumption charts and bottleneck
 * detection are added in the statistics step once the simulation exists.
 */
export default function StatsPanel() {
  const closePanel = useUiStore((s) => s.closePanel)

  return (
    <Panel title="Statistics" onClose={closePanel} className="ff-side-panel">
      <p style={{ color: 'var(--ff-color-text-muted)', fontSize: 'var(--ff-font-size-sm)' }}>
        Production charts and bottleneck detection appear here once the simulation is running.
      </p>
    </Panel>
  )
}
