import { PANEL, useUiStore } from '../state/uiStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import HudBar from '../components/hud/HudBar'
import BuildToolbar from '../components/build/BuildToolbar'
import InspectorPanel from '../components/inspector/InspectorPanel'
import StatsPanel from '../components/stats/StatsPanel'
import ResearchPanel from '../components/research/ResearchPanel'
import SettingsPanel from '../components/settings/SettingsPanel'
import ShortcutsHelp from '../components/settings/ShortcutsHelp'
import NotificationStack from '../components/common/NotificationStack'
import GameCanvas from '../components/world/GameCanvas.jsx'
import './App.css'

export default function App() {
  useKeyboardShortcuts()
  const activePanel = useUiStore((s) => s.activePanel)
  const worldEpoch = useUiStore((s) => s.worldEpoch)
  const pendingLoad = useUiStore((s) => s.pendingLoad)

  return (
    <div className="ff-app">
      <HudBar />

      <main className="ff-viewport">
        <GameCanvas key={worldEpoch} initialSave={pendingLoad} />

        <NotificationStack />
        <InspectorPanel />
        {activePanel === PANEL.STATS && <StatsPanel />}
        {activePanel === PANEL.RESEARCH && <ResearchPanel />}
        <BuildToolbar />
      </main>

      {activePanel === PANEL.SETTINGS && <SettingsPanel />}
      {activePanel === PANEL.SHORTCUTS && <ShortcutsHelp />}
    </div>
  )
}
