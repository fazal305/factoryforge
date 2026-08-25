const DEFAULT_MAX_HISTORY = 100

/**
 * Undo/redo for user construction actions only — placing, removing,
 * rotating a building. Simulation ticks (production, item movement)
 * never go through here; only things the player explicitly did.
 */
export class CommandHistory {
  constructor(maxSize = DEFAULT_MAX_HISTORY) {
    this.maxSize = maxSize
    this.undoStack = []
    this.redoStack = []
  }

  execute(command) {
    command.do()
    this.undoStack.push(command)
    if (this.undoStack.length > this.maxSize) this.undoStack.shift()
    this.redoStack = []
  }

  undo() {
    const command = this.undoStack.pop()
    if (!command) return false
    command.undo()
    this.redoStack.push(command)
    return true
  }

  redo() {
    const command = this.redoStack.pop()
    if (!command) return false
    command.do()
    this.undoStack.push(command)
    return true
  }

  canUndo() {
    return this.undoStack.length > 0
  }

  canRedo() {
    return this.redoStack.length > 0
  }
}
