import { Component } from 'react'
import './ErrorBoundary.css'

/**
 * Catches render errors in the wrapped subtree and shows a fallback panel
 * instead of a blank/crashed screen. Saves live in IndexedDB independently
 * of React's render tree, so a crash here does not touch them.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('FactoryForge crashed:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="ff-error-boundary" role="alert">
        <div className="ff-error-boundary__panel">
          <span className="ff-error-boundary__icon" aria-hidden="true">
            ⚠
          </span>
          <h2 className="ff-error-boundary__title">Something jammed</h2>
          <p className="ff-error-boundary__message">
            {this.props.label ?? 'This part of FactoryForge hit an unexpected error.'} Your save
            data lives in the browser's local database, separate from this screen, so it's safe —
            this only affects the current view.
          </p>
          <button type="button" className="ff-error-boundary__retry" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      </div>
    )
  }
}
