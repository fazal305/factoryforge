import { useEffect } from 'react'
import { PANEL, useUiStore } from '../state/uiStore'
import { getEngineInstance } from '../game/engine/engineInstance.js'
import { createRemoveCommand } from '../game/engine/constructionCommands.js'

/**
 * Global keyboard shortcuts. Ignored while typing in an input/textarea so
 * settings fields and future text inputs stay usable.
 */
export function useKeyboardShortcuts() {
  const togglePause = useUiStore((s) => s.togglePause)
  const rotatePlacement = useUiStore((s) => s.rotatePlacement)
  const cancelBuildMode = useUiStore((s) => s.cancelBuildMode)
  const openPanel = useUiStore((s) => s.openPanel)
  const selectedBuildingId = useUiStore((s) => s.selectedBuildingId)

  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target
      const isTyping = target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isTyping) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePause()
          break
        case 'r':
        case 'R':
          if (selectedBuildingId) rotatePlacement()
          break
        case 'Escape':
          cancelBuildMode()
          break
        case 'b':
        case 'B':
          openPanel(PANEL.NONE) // build toolbar is always visible; reserved for future build-menu modal
          break
        case '?':
          openPanel(PANEL.SHORTCUTS)
          break
        case 'Delete':
        case 'Backspace':
          handleRemoveSelected()
          break
        case 'u':
        case 'U':
          getEngineInstance()?.simulation.history.undo()
          break
        case 'z':
        case 'Z':
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault()
            getEngineInstance()?.simulation.history.redo()
          }
          break
        default:
          break
      }
    }

    function handleRemoveSelected() {
      const { selectedEntityId, clearSelection } = useUiStore.getState()
      if (selectedEntityId == null) return
      const engine = getEngineInstance()
      if (!engine) return
      const command = createRemoveCommand(engine.simulation, selectedEntityId)
      if (!command) return
      engine.simulation.history.execute(command)
      clearSelection()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePause, rotatePlacement, cancelBuildMode, openPanel, selectedBuildingId])
}
