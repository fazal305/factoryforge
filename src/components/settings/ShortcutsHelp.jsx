import { useUiStore } from '../../state/uiStore'
import Modal from '../common/Modal'

const SHORTCUTS = [
  ['Space', 'Pause / resume'],
  ['R', 'Rotate building (while placing)'],
  ['Esc', 'Cancel placement'],
  ['?', 'Toggle this help'],
]

export default function ShortcutsHelp() {
  const closePanel = useUiStore((s) => s.closePanel)

  return (
    <Modal title="Keyboard Shortcuts" onClose={closePanel}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--ff-font-size-sm)' }}>
        <tbody>
          {SHORTCUTS.map(([key, desc]) => (
            <tr key={key}>
              <td style={{ padding: '6px 0', width: 100 }}>
                <kbd
                  style={{
                    background: 'var(--ff-color-bg-inset)',
                    border: '1px solid var(--ff-color-border-strong)',
                    borderRadius: 'var(--ff-radius-sm)',
                    padding: '2px 8px',
                    fontFamily: 'var(--ff-font-mono)',
                  }}
                >
                  {key}
                </kbd>
              </td>
              <td style={{ color: 'var(--ff-color-text-secondary)' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
