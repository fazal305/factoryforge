import { useCallback } from 'react'
import { RESOURCES, RESOURCE_LIST } from '../../data/resources'
import { useSimulationSnapshot } from '../../hooks/useSimulationSnapshot.js'

export default function ResourceReadout() {
  const selectInventory = useCallback((engine) => {
    const inventory = engine?.simulation?.playerInventory
    if (!inventory) return []
    return RESOURCE_LIST.filter((r) => (inventory.get(r.id) ?? 0) > 0).map((r) => [r.id, inventory.get(r.id)])
  }, [])
  const entries = useSimulationSnapshot(selectInventory, 400)

  if (!entries || entries.length === 0) return null

  return (
    <div className="ff-hud__resources" aria-label="Resource inventory">
      {entries.map(([id, count]) => {
        const resource = RESOURCES[id]
        return (
          <div key={id} className="ff-hud__resource" title={resource.name}>
            <span className="ff-hud__resource-swatch" style={{ background: resource.color }} />
            <span className="ff-hud__resource-count">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
