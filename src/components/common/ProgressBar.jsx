import './ProgressBar.css'

export default function ProgressBar({ value, tone = 'accent', label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)))

  return (
    <div className="ff-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`ff-progress__fill ff-progress__fill--${tone}`} style={{ width: `${pct}%` }} />
      {label && <span className="ff-progress__label">{label}</span>}
    </div>
  )
}
