import { useUiStore } from '../../state/uiStore'
import Modal from '../common/Modal'
import './SettingsPanel.css'

function Toggle({ label, checked, onChange }) {
  return (
    <label className="ff-settings__row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export default function SettingsPanel() {
  const settings = useUiStore((s) => s.settings)
  const updateSettings = useUiStore((s) => s.updateSettings)
  const closePanel = useUiStore((s) => s.closePanel)

  return (
    <Modal title="Settings" onClose={closePanel}>
      <div className="ff-settings">
        <Toggle
          label="Sound effects"
          checked={settings.soundEnabled}
          onChange={(v) => updateSettings({ soundEnabled: v })}
        />
        <Toggle
          label="Music"
          checked={settings.musicEnabled}
          onChange={(v) => updateSettings({ musicEnabled: v })}
        />
        <label className="ff-settings__row">
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
          />
        </label>
        <Toggle
          label="Prefer reduced motion"
          checked={settings.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
        />
      </div>
    </Modal>
  )
}
