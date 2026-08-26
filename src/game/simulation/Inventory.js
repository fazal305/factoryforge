import { RESOURCES } from '../../data/resources.js'

/**
 * A capacity-aware item store, shared by the player's inventory,
 * machine input/output ports, and storage chests — the one place that
 * knows how much of a resource fits, so nothing else has to duplicate
 * a capacity check or a magic number.
 *
 * Capacity is per resource type, not a single slot count: `add`/
 * `remove` report how much actually moved so a caller (an inserter, a
 * production system) can tell a partial transfer from a full one
 * without needing to inspect capacity itself.
 *
 * `capacityOverride` lets machine ports use a flat buffer size distinct
 * from a full stack — a furnace's input slot isn't meant to hold as
 * much as a storage chest, even for the same resource.
 */
export class Inventory {
  constructor(capacityOverride = null) {
    this.stacks = new Map()
    this.capacityOverride = capacityOverride
  }

  capacityFor(resourceId) {
    if (this.capacityOverride != null) return this.capacityOverride
    return RESOURCES[resourceId]?.stackLimit ?? Infinity
  }

  get(resourceId) {
    return this.stacks.get(resourceId) ?? 0
  }

  spaceFor(resourceId) {
    return Math.max(0, this.capacityFor(resourceId) - this.get(resourceId))
  }

  canAdd(resourceId, qty) {
    return this.spaceFor(resourceId) >= qty
  }

  has(resourceId, qty) {
    return this.get(resourceId) >= qty
  }

  /** Adds up to capacity; returns how much was actually added. */
  add(resourceId, qty) {
    const added = Math.min(qty, this.spaceFor(resourceId))
    if (added > 0) this.stacks.set(resourceId, this.get(resourceId) + added)
    return added
  }

  /** Removes up to what's available; returns how much was actually removed. */
  remove(resourceId, qty) {
    const removed = Math.min(qty, this.get(resourceId))
    if (removed > 0) this.stacks.set(resourceId, this.get(resourceId) - removed)
    return removed
  }

  /** Any resource id currently holding a positive amount. */
  firstAvailable() {
    for (const [resourceId, qty] of this.stacks) {
      if (qty > 0) return resourceId
    }
    return null
  }

  entries() {
    return this.stacks.entries()
  }

  clone() {
    const copy = new Inventory(this.capacityOverride)
    copy.stacks = new Map(this.stacks)
    return copy
  }
}
