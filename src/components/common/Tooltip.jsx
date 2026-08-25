import { useId, useState } from 'react'
import './Tooltip.css'

/**
 * Minimal hover/focus tooltip. Used to label icon-only controls so they
 * remain understandable without relying on color or shape alone.
 */
export default function Tooltip({ label, children }) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  if (!label) return children

  return (
    <span
      className="ff-tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {typeof children === 'function' ? children({ describedBy: id }) : children}
      {visible && (
        <span role="tooltip" id={id} className="ff-tooltip">
          {label}
        </span>
      )}
    </span>
  )
}
