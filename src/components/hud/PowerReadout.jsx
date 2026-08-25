// Placeholder figures until the power system (Step 9) reports real
// production/consumption from the simulation snapshot.
const PLACEHOLDER_POWER = { production: 0, consumption: 0 }

export default function PowerReadout() {
  const { production, consumption } = PLACEHOLDER_POWER
  const overloaded = consumption > production

  return (
    <div className={`ff-hud__power${overloaded ? ' ff-hud__power--overloaded' : ''}`} title="Power grid">
      <span className="ff-hud__power-icon" aria-hidden="true">
        ⚡
      </span>
      <span className="ff-hud__power-value">
        {consumption} / {production} kW
      </span>
    </div>
  )
}
