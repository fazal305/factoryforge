import { useUiStore } from '../../state/uiStore'
import Panel from '../common/Panel'

/**
 * Placeholder shell — the research tree (data-driven from
 * data/research.js) is wired in during the research step.
 */
export default function ResearchPanel() {
  const closePanel = useUiStore((s) => s.closePanel)

  return (
    <Panel title="Research" onClose={closePanel} className="ff-side-panel">
      <p style={{ color: 'var(--ff-color-text-muted)', fontSize: 'var(--ff-font-size-sm)' }}>
        The research tree unlocks here once the research system is implemented.
      </p>
    </Panel>
  )
}
