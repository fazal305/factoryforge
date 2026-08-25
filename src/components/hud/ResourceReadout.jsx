import { RESOURCES } from '../../data/resources'

// Placeholder counts until the inventory system (Step 10) provides real
// player-inventory totals through a snapshot selector.
const PLACEHOLDER_COUNTS = {
  ironOre: 0,
  copperOre: 0,
  coal: 0,
  stone: 0,
}

const TRACKED_IDS = Object.keys(PLACEHOLDER_COUNTS)

export default function ResourceReadout() {
  return (
    <div className="ff-hud__resources" aria-label="Resource inventory">
      {TRACKED_IDS.map((id) => {
        const resource = RESOURCES[id]
        return (
          <div key={id} className="ff-hud__resource" title={resource.name}>
            <span className="ff-hud__resource-swatch" style={{ background: resource.color }} />
            <span className="ff-hud__resource-count">{PLACEHOLDER_COUNTS[id]}</span>
          </div>
        )
      })}
    </div>
  )
}
