import { useCallback } from 'react'
import { useUiStore } from '../../state/uiStore'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'
import { getEngineInstance } from '../../game/engine/engineInstance.js'
import { createRemoveCommand } from '../../game/engine/constructionCommands.js'
import { BUILD_CATEGORY, BUILDINGS, BUILD_CATEGORY_LABEL } from '../../data/buildings'
import { RECIPES, recipesForBuilding } from '../../data/recipes'
import { RESOURCES } from '../../data/resources'
import { RESEARCH, isRecipeUnlocked, recipeUnlockRequirement } from '../../data/research'
import Panel from '../common/Panel'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import './InspectorPanel.css'

const STATUS_LABEL = {
  idle: 'Idle',
  starved: 'Waiting for input',
  blocked: 'Output full',
  running: 'Running',
  unpowered: 'Unpowered',
}

const STATUS_TONE = {
  idle: undefined,
  starved: 'warning',
  blocked: 'danger',
  running: 'success',
  unpowered: 'danger',
}

function bufferEntries(buffer) {
  if (!buffer) return []
  return [...buffer.entries()].filter(([, qty]) => qty > 0)
}

function BufferList({ title, buffer }) {
  const entries = bufferEntries(buffer)
  return (
    <div className="ff-inspector__buffer">
      <span className="ff-inspector__buffer-title">{title}</span>
      {entries.length === 0 ? (
        <span className="ff-inspector__buffer-empty">Empty</span>
      ) : (
        <ul className="ff-inspector__buffer-list">
          {entries.map(([resourceId, qty]) => (
            <li key={resourceId}>
              <span
                className="ff-hud__resource-swatch"
                style={{ background: RESOURCES[resourceId].color }}
              />
              {RESOURCES[resourceId].name} × {qty}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Right-side inspector. Shows the selected building's live status —
 * mining progress and deposit remaining for drills, recipe selection
 * and input/output buffers for furnaces/assemblers.
 */
export default function InspectorPanel() {
  const selectedEntityId = useUiStore((s) => s.selectedEntityId)
  const clearSelection = useUiStore((s) => s.clearSelection)

  const selectBuilding = useCallback(
    (engine) => {
      if (selectedEntityId == null) return null
      const b = engine.simulation.buildingsById.get(selectedEntityId)
      if (!b) return null
      // Clone so the polled snapshot's identity changes even though the
      // engine mutates this object in place every tick — otherwise
      // React would never see a change to re-render on.
      return {
        ...b,
        inputBuffer: b.inputBuffer?.clone(),
        outputBuffer: b.outputBuffer?.clone(),
        depositRemaining:
          b.depositTileIndex != null ? engine.simulation.world.depositAmount[b.depositTileIndex] : null,
        completedResearch: new Set(engine.simulation.completedResearch),
        activeResearchId: engine.simulation.activeResearchId,
      }
    },
    [selectedEntityId],
  )
  const building = useSimulationSnapshot(selectBuilding, 250)

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

  function handleSelectRecipe(recipeId) {
    const engine = getEngineInstance()
    const target = engine?.simulation.buildingsById.get(building.id)
    if (!target) return
    target.recipeId = recipeId
    target.processing = false
    target.progress = 0
    target.status = 'idle'
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

        {def.powerConsumption > 0 && (
          <span className={`ff-inspector__status ff-inspector__status--${building.powered ? 'success' : 'danger'}`}>
            {building.powered ? 'Powered' : 'Unpowered — not in range of a pole with enough supply'}
          </span>
        )}

        {building.fuelSeconds !== undefined && (
          <div className="ff-inspector__section">
            <span className={`ff-inspector__status ff-inspector__status--${building.generating ? 'success' : 'warning'}`}>
              {building.generating ? 'Generating' : 'No fuel'}
            </span>
            <ProgressBar value={Math.min(1, building.fuelSeconds / def.fuelPerCoal)} label="fuel" />
            <BufferList title="Fuel (coal)" buffer={building.inputBuffer} />
          </div>
        )}

        {def.category === BUILD_CATEGORY.STORAGE && (
          <div className="ff-inspector__section">
            <BufferList title="Stored" buffer={building.inputBuffer} />
          </div>
        )}

        {building.depositTileIndex !== undefined && (
          <div className="ff-inspector__section">
            {building.depositResourceId ? (
              <>
                <dl className="ff-inspector__facts">
                  <div>
                    <dt>Deposit</dt>
                    <dd>{RESOURCES[building.depositResourceId].name}</dd>
                  </div>
                  <div>
                    <dt>Remaining</dt>
                    <dd>{building.depositRemaining}</dd>
                  </div>
                </dl>
                <ProgressBar value={building.progress} label="mining" />
                <BufferList title="Output" buffer={building.outputBuffer} />
              </>
            ) : (
              <p className="ff-inspector__warning">No resource deposit under this drill.</p>
            )}
          </div>
        )}

        {building.researching !== undefined && (
          <div className="ff-inspector__section">
            <span className={`ff-inspector__status ff-inspector__status--${STATUS_TONE[building.status] ?? 'default'}`}>
              {STATUS_LABEL[building.status] ?? building.status}
            </span>
            {building.activeResearchId ? (
              <>
                <p className="ff-inspector__description">Researching: {RESEARCH[building.activeResearchId].name}</p>
                <ProgressBar value={building.progress / RESEARCH[building.activeResearchId].cycleTime} label={STATUS_LABEL[building.status]} />
              </>
            ) : (
              <p className="ff-inspector__warning">No active research — pick one in the Research panel.</p>
            )}
            <BufferList title="Science pack" buffer={building.inputBuffer} />
          </div>
        )}

        {building.recipeId !== undefined && (
          <div className="ff-inspector__section">
            <span className={`ff-inspector__status ff-inspector__status--${STATUS_TONE[building.status] ?? 'default'}`}>
              {STATUS_LABEL[building.status] ?? building.status}
            </span>

            <div className="ff-inspector__recipes">
              {recipesForBuilding(building.typeId).map((recipe) => {
                const unlocked = isRecipeUnlocked(recipe.id, building.completedResearch)
                const requirement = recipeUnlockRequirement(recipe.id)
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    disabled={!unlocked}
                    className={`ff-inspector__recipe${building.recipeId === recipe.id ? ' ff-inspector__recipe--active' : ''}`}
                    onClick={() => handleSelectRecipe(recipe.id)}
                    title={unlocked ? undefined : `Requires research: ${requirement.name}`}
                  >
                    {recipe.name}
                    {!unlocked && ' 🔒'}
                  </button>
                )
              })}
            </div>

            {building.recipeId && (
              <ProgressBar value={building.progress / RECIPES[building.recipeId].time} label={STATUS_LABEL[building.status]} />
            )}

            <BufferList title="Input" buffer={building.inputBuffer} />
            <BufferList title="Output" buffer={building.outputBuffer} />
          </div>
        )}

        <p className="ff-inspector__description">{def.description}</p>

        <Button variant="danger" onClick={handleRemove}>
          Remove (Del)
        </Button>
      </div>
    </Panel>
  )
}
