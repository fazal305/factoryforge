import { useUiStore } from '../../state/uiStore'
import './NotificationStack.css'

const TONE_CLASS = {
  info: 'ff-toast--info',
  success: 'ff-toast--success',
  warning: 'ff-toast--warning',
  danger: 'ff-toast--danger',
}

export default function NotificationStack() {
  const notifications = useUiStore((s) => s.notifications)
  const dismissNotification = useUiStore((s) => s.dismissNotification)

  if (notifications.length === 0) return null

  return (
    <div className="ff-toast-stack" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`ff-toast ${TONE_CLASS[n.tone] ?? TONE_CLASS.info}`}>
          <span>{n.message}</span>
          <button type="button" onClick={() => dismissNotification(n.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
