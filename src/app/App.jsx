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
import './App.css'

export default function App() {
  useKeyboardShortcuts()
  const activePanel = useUiStore((s) => s.activePanel)

  return (
    <div className="ff-app">
      <HudBar />

      <main className="ff-viewport">
        <div className="ff-viewport__placeholder">
          <span>Isometric world viewport</span>
          <span className="ff-viewport__placeholder-sub">Renderer arrives in the next step</span>
        </div>

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
