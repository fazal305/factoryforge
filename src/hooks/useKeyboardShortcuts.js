import { useEffect } from 'react'
import { PANEL, useUiStore } from '../state/uiStore'

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
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePause, rotatePlacement, cancelBuildMode, openPanel, selectedBuildingId])
}
