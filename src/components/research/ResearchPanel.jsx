import { useCallback } from 'react'
import { useUiStore } from '../../state/uiStore'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'
import { getEngineInstance } from '../../game/engine/engineInstance.js'
import { RESEARCH_LIST, isResearchAvailable } from '../../data/research'
import { RESOURCES } from '../../data/resources'
import Panel from '../common/Panel'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import './ResearchPanel.css'

function costLabel(cost) {
  return Object.entries(cost)
    .map(([resourceId, qty]) => `${qty} ${RESOURCES[resourceId].name}`)
    .join(' · ')
}

function unlocksLabel(unlocks) {
  const parts = []
  if (unlocks.buildings) parts.push(`Buildings: ${unlocks.buildings.join(', ')}`)
  if (unlocks.recipes) parts.push(`Recipes: ${unlocks.recipes.join(', ')}`)
  if (unlocks.upgrades) parts.push('Upgrade')
  return parts.join(' · ')
}

/**
 * A short linear tech tree. Only one node can be active at a time, but
 * progress toward every node is kept independently (researchProgressByNode)
 * so switching away and back doesn't discard work already done.
 */
export default function ResearchPanel() {
  const closePanel = useUiStore((s) => s.closePanel)
  const selectResearchState = useCallback(
    (engine) => ({
      completedResearch: new Set(engine.simulation.completedResearch),
      activeResearchId: engine.simulation.activeResearchId,
      progressByNode: new Map(engine.simulation.researchProgressByNode),
    }),
    [],
  )
  const state = useSimulationSnapshot(selectResearchState, 400)

  if (!state) {
    return (
      <Panel title="Research" onClose={closePanel} className="ff-side-panel">
        <p style={{ color: 'var(--ff-color-text-muted)', fontSize: 'var(--ff-font-size-sm)' }}>Loading…</p>
      </Panel>
    )
  }

  function setActive(nodeId) {
    const engine = getEngineInstance()
    if (!engine) return
    engine.simulation.activeResearchId = nodeId
  }

  return (
    <Panel title="Research" onClose={closePanel} className="ff-side-panel">
      <div className="ff-research">
        {RESEARCH_LIST.map((node) => {
          const completed = state.completedResearch.has(node.id)
          const available = isResearchAvailable(node.id, state.completedResearch)
          const active = state.activeResearchId === node.id
          const points = state.progressByNode.get(node.id) ?? 0

          return (
            <div
              key={node.id}
              className={`ff-research__node${completed ? ' ff-research__node--completed' : ''}${active ? ' ff-research__node--active' : ''}`}
            >
              <div className="ff-research__node-header">
                <span className="ff-research__node-name">{node.name}</span>
                {completed && <span className="ff-research__badge">Completed</span>}
              </div>
              <p className="ff-research__node-description">{node.description}</p>
              <p className="ff-research__node-unlocks">{unlocksLabel(node.unlocks)}</p>
              <p className="ff-research__node-cost">
                {costLabel(node.cost)} per point · {node.pointsRequired} points
              </p>
              <ProgressBar value={points / node.pointsRequired} label={`${points}/${node.pointsRequired}`} />
              {!completed && (
                <Button variant={active ? 'primary' : 'secondary'} disabled={!available} onClick={() => setActive(node.id)}>
                  {active ? 'Researching…' : available ? 'Research' : 'Locked'}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
