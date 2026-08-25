import { useUiStore } from '../../state/uiStore'
import Panel from '../common/Panel'
import './InspectorPanel.css'

/**
 * Right-side inspector. Shows details for the currently selected
 * building once the world/entity systems exist; for now it only
 * demonstrates the empty state, since nothing is selectable yet.
 */
export default function InspectorPanel() {
  const selectedEntityId = useUiStore((s) => s.selectedEntityId)
  const clearSelection = useUiStore((s) => s.clearSelection)

  if (!selectedEntityId) {
    return (
      <Panel title="Inspector" className="ff-inspector">
        <div className="ff-inspector__empty">
          <p>Select a building to see its status, inputs, outputs, and production rate.</p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Inspector" onClose={clearSelection} className="ff-inspector">
      <div className="ff-inspector__empty">Entity details arrive with the building system.</div>
    </Panel>
  )
}
