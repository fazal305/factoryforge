/**
 * Minimal synchronous pub/sub used to decouple simulation systems from
 * each other and from the UI (e.g. a production system emitting
 * 'buildingStarved' without importing the notification store).
 */
export class EventBus {
  constructor() {
    this.listeners = new Map()
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set())
    this.listeners.get(eventName).add(handler)
    return () => this.off(eventName, handler)
  }

  off(eventName, handler) {
    this.listeners.get(eventName)?.delete(handler)
  }

  emit(eventName, payload) {
    this.listeners.get(eventName)?.forEach((handler) => handler(payload))
  }
}
