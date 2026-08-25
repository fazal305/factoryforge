import { isoToTile, tileToIso } from './isoProjection.js'

export const MIN_ZOOM = 0.4
export const MAX_ZOOM = 2.5

/**
 * Plain mutable camera object — deliberately not React state. The
 * render loop reads/writes it every frame; routing it through Zustand
 * or useState would cost a re-render (or a subscription) per pan/zoom
 * tick for no benefit, since nothing outside the canvas needs it.
 */
export function createCamera() {
  return { x: 0, y: 0, zoom: 1 }
}

export function worldToScreen(camera, canvasWidth, canvasHeight, tileX, tileY) {
  const iso = tileToIso(tileX, tileY)
  return {
    x: (iso.x - camera.x) * camera.zoom + canvasWidth / 2,
    y: (iso.y - camera.y) * camera.zoom + canvasHeight / 2,
  }
}

export function screenToWorld(camera, canvasWidth, canvasHeight, screenX, screenY) {
  const isoX = (screenX - canvasWidth / 2) / camera.zoom + camera.x
  const isoY = (screenY - canvasHeight / 2) / camera.zoom + camera.y
  return isoToTile(isoX, isoY)
}

export function panCamera(camera, dxScreen, dyScreen) {
  camera.x -= dxScreen / camera.zoom
  camera.y -= dyScreen / camera.zoom
}

/** Zooms while keeping the iso point under (screenX, screenY) stationary. */
export function zoomCameraAt(camera, canvasWidth, canvasHeight, screenX, screenY, factor) {
  const isoXBefore = (screenX - canvasWidth / 2) / camera.zoom + camera.x
  const isoYBefore = (screenY - canvasHeight / 2) / camera.zoom + camera.y

  camera.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor))

  camera.x = isoXBefore - (screenX - canvasWidth / 2) / camera.zoom
  camera.y = isoYBefore - (screenY - canvasHeight / 2) / camera.zoom
}
