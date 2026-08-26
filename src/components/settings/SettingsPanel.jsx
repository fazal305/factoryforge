import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../../state/uiStore'
import { getEngineInstance } from '../../game/engine/engineInstance.js'
import { deleteSave, getSaveData, listSaves, saveGame, serializeSimulation } from '../../storage/saveGame.js'
import { exportSaveData, parseImportedSave, readFileAsText } from '../../storage/importExport.js'
import Modal from '../common/Modal'
import Button from '../common/Button'
import './SettingsPanel.css'

function Toggle({ label, checked, onChange }) {
  return (
    <label className="ff-settings__row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function SettingsPanel() {
  const settings = useUiStore((s) => s.settings)
  const updateSettings = useUiStore((s) => s.updateSettings)
  const closePanel = useUiStore((s) => s.closePanel)
  const pushNotification = useUiStore((s) => s.pushNotification)
  const requestNewGame = useUiStore((s) => s.requestNewGame)
  const requestLoadGame = useUiStore((s) => s.requestLoadGame)

  const [saveName, setSaveName] = useState('')
  const [saves, setSaves] = useState([])
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef(null)

  async function refreshSaves() {
    try {
      setSaves(await listSaves())
    } catch {
      pushNotification({ tone: 'danger', message: 'Could not read saved games' })
    }
  }

  useEffect(() => {
    refreshSaves()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function currentEngineOrWarn() {
    const engine = getEngineInstance()
    if (!engine) pushNotification({ tone: 'danger', message: 'No active game to save' })
    return engine
  }

  async function handleSave() {
    const engine = currentEngineOrWarn()
    if (!engine) return
    const name = saveName.trim() || `Save ${new Date().toLocaleString()}`
    setBusy(true)
    try {
      await saveGame(name, engine.simulation, engine.gameLoop)
      pushNotification({ tone: 'success', message: `Saved "${name}"` })
      setSaveName('')
      await refreshSaves()
    } catch {
      pushNotification({ tone: 'danger', message: 'Save failed' })
    } finally {
      setBusy(false)
    }
  }

  async function handleLoad(name) {
    if (!window.confirm(`Load "${name}"? Any unsaved progress in the current game will be lost.`)) return
    setBusy(true)
    try {
      const data = await getSaveData(name)
      requestLoadGame(data)
      pushNotification({ tone: 'success', message: `Loaded "${name}"` })
      closePanel()
    } catch (err) {
      pushNotification({ tone: 'danger', message: err.message || 'Load failed' })
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete save "${name}"? This cannot be undone.`)) return
    try {
      await deleteSave(name)
      pushNotification({ tone: 'info', message: `Deleted "${name}"` })
      await refreshSaves()
    } catch {
      pushNotification({ tone: 'danger', message: 'Delete failed' })
    }
  }

  function handleNewGame() {
    if (!window.confirm('Start a new game? Any unsaved progress in the current game will be lost.')) return
    requestNewGame()
    closePanel()
  }

  function handleExport() {
    const engine = currentEngineOrWarn()
    if (!engine) return
    const data = serializeSimulation(engine.simulation, engine.gameLoop)
    exportSaveData(data)
    pushNotification({ tone: 'success', message: 'Save exported' })
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same filename later
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const data = parseImportedSave(text)
      requestLoadGame(data)
      pushNotification({ tone: 'success', message: `Imported "${file.name}"` })
      closePanel()
    } catch (err) {
      pushNotification({ tone: 'danger', message: err.message || 'Import failed — file is not a valid save' })
    }
  }

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

        <div className="ff-settings__section">
          <h3 className="ff-settings__heading">Save &amp; Load</h3>

          <div className="ff-settings__save-row">
            <input
              type="text"
              className="ff-settings__save-input"
              placeholder="Save name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Button variant="primary" disabled={busy} onClick={handleSave}>
              Save Game
            </Button>
          </div>

          {saves.length > 0 && (
            <ul className="ff-settings__save-list">
              {saves.map((save) => (
                <li key={save.name}>
                  <div>
                    <span className="ff-settings__save-name">{save.name}</span>
                    <span className="ff-settings__save-date">{formatDate(save.savedAt)}</span>
                  </div>
                  <div className="ff-settings__save-actions">
                    <Button variant="secondary" disabled={busy} onClick={() => handleLoad(save.name)}>
                      Load
                    </Button>
                    <Button variant="danger" disabled={busy} onClick={() => handleDelete(save.name)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="ff-settings__actions-row">
            <Button variant="secondary" onClick={handleExport}>
              Export Save
            </Button>
            <Button variant="secondary" onClick={handleImportClick}>
              Import Save
            </Button>
            <Button variant="danger" onClick={handleNewGame}>
              New Game
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="ff-settings__file-input"
            onChange={handleImportFile}
          />
        </div>
      </div>
    </Modal>
  )
}
