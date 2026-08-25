/**
 * Root application shell. This currently renders a placeholder frame so
 * the project boots end-to-end; the HUD, canvas viewport, toolbar, and
 * inspector are wired in during later steps (world/renderer, then UI).
 */
export default function App() {
  return (
    <div className="ff-app">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ff-space-4)',
          padding: '0 var(--ff-space-5)',
          background: 'var(--ff-color-bg-panel)',
          borderBottom: '1px solid var(--ff-color-border)',
        }}
      >
        <strong style={{ color: 'var(--ff-color-accent)', letterSpacing: '0.02em' }}>
          FACTORYFORGE
        </strong>
        <span style={{ color: 'var(--ff-color-text-muted)', fontSize: 'var(--ff-font-size-sm)' }}>
          scaffold booted — world renderer arrives in a later step
        </span>
      </header>
      <main
        style={{
          background: 'var(--ff-color-bg-canvas)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ff-color-text-secondary)',
        }}
      >
        Isometric viewport placeholder
      </main>
    </div>
  )
}
