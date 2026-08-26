import { useEffect, useRef } from 'react'
import './Modal.css'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// The selector alone still matches visually-hidden elements (e.g. the
// off-screen file input Settings uses for Import) — offsetParent is
// null for anything with display:none, so this excludes those without
// needing to special-case specific components here.
function getFocusable(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((el) => el.offsetParent !== null)
}

export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  // Move focus into the dialog on open, and back to whatever triggered
  // it on close — without this, keyboard/screen-reader users lose their
  // place the moment a modal opens.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement
    const first = dialogRef.current ? getFocusable(dialogRef.current)[0] : null
    first?.focus()

    return () => {
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }

      // Trap Tab within the dialog so focus can't escape to the page
      // behind it while the modal is open.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = getFocusable(dialogRef.current)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement

        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="ff-modal-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="ff-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="ff-modal__header">
          <h2 className="ff-modal__title">{title}</h2>
          <button type="button" className="ff-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="ff-modal__body">{children}</div>
      </div>
    </div>
  )
}
