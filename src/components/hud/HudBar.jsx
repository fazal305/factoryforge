import { PANEL, SIM_SPEEDS, useUiStore } from '../../state/uiStore'
import IconButton from '../common/IconButton'
import Tooltip from '../common/Tooltip'
import ResourceReadout from './ResourceReadout'
import PowerReadout from './PowerReadout'
import './HudBar.css'

/**
 * Top HUD: resource totals, power summary, simulation transport
 * controls, and access to the secondary panels. Reads only from
 * uiStore + the (future) throttled simulation snapshot — never touches
 * per-tick simulation state directly.
 */
export default function HudBar() {
  const isPaused = useUiStore((s) => s.isPaused)
  const simSpeed = useUiStore((s) => s.simSpeed)
  const togglePause = useUiStore((s) => s.togglePause)
  const setSimSpeed = useUiStore((s) => s.setSimSpeed)
  const openPanel = useUiStore((s) => s.openPanel)
  const activePanel = useUiStore((s) => s.activePanel)

  return (
    <div className="ff-hud">
      <div className="ff-hud__brand">FACTORYFORGE</div>

      <ResourceReadout />

      <PowerReadout />

      <div className="ff-hud__transport">
        <Tooltip label={isPaused ? 'Resume (Space)' : 'Pause (Space)'}>
          <IconButton active={isPaused} onClick={togglePause} title={isPaused ? 'Resume' : 'Pause'}>
            {isPaused ? '▶' : '⏸'}
          </IconButton>
        </Tooltip>

        <div className="ff-hud__speeds" role="group" aria-label="Simulation speed">
          {SIM_SPEEDS.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`ff-hud__speed-btn${!isPaused && simSpeed === speed ? ' ff-hud__speed-btn--active' : ''}`}
              onClick={() => setSimSpeed(speed)}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      <div className="ff-hud__panels">
        <Tooltip label="Statistics">
          <IconButton active={activePanel === PANEL.STATS} onClick={() => openPanel(PANEL.STATS)} title="Statistics">
            📊
          </IconButton>
        </Tooltip>
        <Tooltip label="Research">
          <IconButton
            active={activePanel === PANEL.RESEARCH}
            onClick={() => openPanel(PANEL.RESEARCH)}
            title="Research"
          >
            🔬
          </IconButton>
        </Tooltip>
        <Tooltip label="Settings">
          <IconButton
            active={activePanel === PANEL.SETTINGS}
            onClick={() => openPanel(PANEL.SETTINGS)}
            title="Settings"
          >
            ⚙
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}
