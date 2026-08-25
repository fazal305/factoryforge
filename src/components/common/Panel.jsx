import './Panel.css'

/**
 * Shared chrome for floating HUD panels (inspector, stats, research,
 * settings): consistent header, close affordance, and scroll body.
 */
export default function Panel({ title, onClose, children, className = '' }) {
  return (
    <section className={`ff-panel ${className}`.trim()} aria-label={title}>
      <header className="ff-panel__header">
        <h2 className="ff-panel__title">{title}</h2>
        {onClose && (
          <button type="button" className="ff-panel__close" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        )}
      </header>
      <div className="ff-panel__body">{children}</div>
    </section>
  )
}
