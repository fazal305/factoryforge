import { useEffect } from 'react'
import './Modal.css'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="ff-modal-backdrop" onMouseDown={onClose}>
      <div
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
