import { useCallback } from 'react'
import { useUiStore } from '../../state/uiStore'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'
import { getEngineInstance } from '../../game/engine/engineInstance.js'
import { createRemoveCommand } from '../../game/engine/constructionCommands.js'
import { BUILDINGS, BUILD_CATEGORY_LABEL } from '../../data/buildings'
import Panel from '../common/Panel'
import Button from '../common/Button'
import './InspectorPanel.css'

/**
 * Right-side inspector. Shows the selected building's static facts now
 * (name, footprint, power draw); live status/inputs/outputs/progress
 * join this once the production system exists (Step 7).
 */
export default function InspectorPanel() {
  const selectedEntityId = useUiStore((s) => s.selectedEntityId)
  const clearSelection = useUiStore((s) => s.clearSelection)

  const selectBuilding = useCallback(
    (engine) => (selectedEntityId == null ? null : (engine.simulation.buildingsById.get(selectedEntityId) ?? null)),
    [selectedEntityId],
  )
  const building = useSimulationSnapshot(selectBuilding, 300)

  if (!building) {
    return (
      <Panel title="Inspector" className="ff-inspector">
        <div className="ff-inspector__empty">
          <p>Select a building to see its status, inputs, outputs, and production rate.</p>
        </div>
      </Panel>
    )
  }

  const def = BUILDINGS[building.typeId]

  function handleRemove() {
    const engine = getEngineInstance()
    if (!engine) return
    const command = createRemoveCommand(engine.simulation, building.id)
    if (!command) return
    engine.simulation.history.execute(command)
    clearSelection()
  }

  return (
    <Panel title="Inspector" onClose={clearSelection} className="ff-inspector">
      <div className="ff-inspector__building">
        <h3 className="ff-inspector__name">{def.name}</h3>
        <span className="ff-inspector__category">{BUILD_CATEGORY_LABEL[def.category]}</span>

        <dl className="ff-inspector__facts">
          <div>
            <dt>Position</dt>
            <dd>
              {building.x}, {building.y}
            </dd>
          </div>
          <div>
            <dt>Footprint</dt>
            <dd>
              {building.footprint.width}×{building.footprint.height}
            </dd>
          </div>
          {def.powerConsumption > 0 && (
            <div>
              <dt>Power draw</dt>
              <dd>{def.powerConsumption} kW</dd>
            </div>
          )}
          {def.powerGeneration > 0 && (
            <div>
              <dt>Power output</dt>
              <dd>{def.powerGeneration} kW</dd>
            </div>
          )}
        </dl>

        <p className="ff-inspector__description">{def.description}</p>

        <Button variant="danger" onClick={handleRemove}>
          Remove (Del)
        </Button>
      </div>
    </Panel>
  )
}
