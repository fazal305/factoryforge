import { panCamera, screenToWorld, zoomCameraAt } from '../renderer/camera.js'

const DRAG_THRESHOLD_PX = 4
const ZOOM_STEP = 1.12

/**
 * Owns pointer/wheel listeners for the world canvas and turns them into
 * camera mutations + tile hover/click callbacks. Kept outside React so
 * every mouse-move during a pan doesn't touch a component tree.
 */
export class InputController {
  constructor(canvas, camera, { onHoverTile, onSelectTile, getCanvasSize }) {
    this.canvas = canvas
    this.camera = camera
    this.onHoverTile = onHoverTile
    this.onSelectTile = onSelectTile
    this.getCanvasSize = getCanvasSize

    this.dragging = false
    this.dragMoved = false
    this.lastX = 0
    this.lastY = 0

    this.handlePointerDown = this.handlePointerDown.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerUp = this.handlePointerUp.bind(this)
    this.handleWheel = this.handleWheel.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
  }

  attach() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    window.addEventListener('pointermove', this.handlePointerMove)
    window.addEventListener('pointerup', this.handlePointerUp)
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false })
    this.canvas.addEventListener('pointerleave', this.handleLeave)
  }

  detach() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    window.removeEventListener('pointermove', this.handlePointerMove)
    window.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('wheel', this.handleWheel)
    this.canvas.removeEventListener('pointerleave', this.handleLeave)
  }

  handlePointerDown(e) {
    this.dragging = true
    this.dragMoved = false
    this.lastX = e.clientX
    this.lastY = e.clientY
  }

  handlePointerMove(e) {
    const rect = this.canvas.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top

    if (this.dragging) {
      const dx = e.clientX - this.lastX
      const dy = e.clientY - this.lastY
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD_PX) this.dragMoved = true
      if (this.dragMoved) {
        panCamera(this.camera, dx, dy)
        this.lastX = e.clientX
        this.lastY = e.clientY
      }
    }

    const { width, height } = this.getCanvasSize()
    const tile = screenToWorld(this.camera, width, height, localX, localY)
    this.onHoverTile?.({ x: Math.floor(tile.x), y: Math.floor(tile.y) })
  }

  handlePointerUp(e) {
    if (this.dragging && !this.dragMoved) {
      const rect = this.canvas.getBoundingClientRect()
      const localX = e.clientX - rect.left
      const localY = e.clientY - rect.top
      const { width, height } = this.getCanvasSize()
      const tile = screenToWorld(this.camera, width, height, localX, localY)
      this.onSelectTile?.({ x: Math.floor(tile.x), y: Math.floor(tile.y) })
    }
    this.dragging = false
    this.dragMoved = false
  }

  handleWheel(e) {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const { width, height } = this.getCanvasSize()
    const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    zoomCameraAt(this.camera, width, height, localX, localY, factor)
  }

  handleLeave() {
    this.onHoverTile?.(null)
  }
}
