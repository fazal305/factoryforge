import './Button.css'

const VARIANT_CLASS = {
  primary: 'ff-btn--primary',
  secondary: 'ff-btn--secondary',
  ghost: 'ff-btn--ghost',
  danger: 'ff-btn--danger',
}

export default function Button({
  variant = 'secondary',
  active = false,
  disabled = false,
  onClick,
  children,
  title,
  type = 'button',
}) {
  const classes = ['ff-btn', VARIANT_CLASS[variant] ?? VARIANT_CLASS.secondary]
  if (active) classes.push('ff-btn--active')

  return (
    <button
      type={type}
      className={classes.join(' ')}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}
