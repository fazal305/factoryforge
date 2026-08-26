import { useUiStore } from '../../state/uiStore'
import Modal from '../common/Modal'
import './ShortcutsHelp.css'

const SHORTCUTS = [
  ['Space', 'Pause / resume'],
  ['R', 'Rotate building (while placing)'],
  ['Esc', 'Cancel placement'],
  ['Delete / Backspace', 'Remove selected building'],
  ['U', 'Undo last construction action'],
  ['Ctrl/Cmd + Shift + Z', 'Redo'],
  ['?', 'Toggle this help'],
]

export default function ShortcutsHelp() {
  const closePanel = useUiStore((s) => s.closePanel)

  return (
    <Modal title="Keyboard Shortcuts" onClose={closePanel}>
      <ul className="ff-shortcuts">
        {SHORTCUTS.map(([key, desc]) => (
          <li key={key} className="ff-shortcuts__row">
            <kbd className="ff-shortcuts__key">{key}</kbd>
            <span className="ff-shortcuts__desc">{desc}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
