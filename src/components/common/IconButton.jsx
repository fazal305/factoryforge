import './IconButton.css'

export default function IconButton({ active = false, disabled = false, onClick, title, children }) {
  return (
    <button
      type="button"
      className={`ff-icon-btn${active ? ' ff-icon-btn--active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}
