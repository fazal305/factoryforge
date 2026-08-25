import { useEffect, useRef, useState } from 'react'
import { createCamera } from '../../game/renderer/camera.js'
import { tileToIso } from '../../game/renderer/isoProjection.js'
import { drawFrame } from '../../game/renderer/CanvasRenderer.js'
import { invalidateColorCache } from '../../game/renderer/layers/resourceLayer.js'
import { InputController } from '../../game/input/InputController.js'
import { WorldGrid } from '../../game/world/WorldGrid.js'
import { GameLoop } from '../../game/engine/GameLoop.js'
import { SimulationState } from '../../game/simulation/SimulationState.js'
import { setEngineInstance } from '../../game/engine/engineInstance.js'
import { useUiStore } from '../../state/uiStore.js'
import PerformanceMonitor from './PerformanceMonitor.jsx'
import './GameCanvas.css'

const WORLD_WIDTH = 96
const WORLD_HEIGHT = 96
const WORLD_SEED = 20260825

/**
 * Owns the canvas element, the camera, the world-generation worker, and
 * the render loop. This is the boundary between React and the
 * non-React game engine: everything below this component reads/writes
 * plain objects and refs, never React state, on the hot path.
 */
export default function GameCanvas() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const worldRef = useRef(null)
  const cameraRef = useRef(createCamera())
  const hoverTileRef = useRef(null)
  const selectedTileRef = useRef(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ fps: 0, tps: 0, visibleTiles: 0 })

  useEffect(() => {
    const worker = new Worker(new URL('../../workers/worldGen.worker.js', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event) => {
      const grid = WorldGrid.fromTransferable(event.data)
      worldRef.current = grid
      const center = tileToIso(grid.width / 2, grid.height / 2)
      cameraRef.current.x = center.x
      cameraRef.current.y = center.y
      setLoading(false)
    }

    worker.postMessage({ width: WORLD_WIDTH, height: WORLD_HEIGHT, seed: WORLD_SEED })

    return () => worker.terminate()
  }, [])

  useEffect(() => {
    if (loading) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = container.getBoundingClientRect()
      canvasSizeRef.current = { width, height }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      invalidateColorCache()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const simulation = new SimulationState(worldRef.current)
    const gameLoop = new GameLoop({ onTick: (dt) => simulation.runTick(dt) })
    const uiState = useUiStore.getState()
    gameLoop.setPaused(uiState.isPaused)
    gameLoop.setSpeed(uiState.simSpeed)
    const unsubscribeUi = useUiStore.subscribe((state) => {
      gameLoop.setPaused(state.isPaused)
      gameLoop.setSpeed(state.simSpeed)
    })
    setEngineInstance({ simulation, gameLoop })

    const input = new InputController(canvas, cameraRef.current, {
      getCanvasSize: () => canvasSizeRef.current,
      onHoverTile: (tile) => {
        hoverTileRef.current = tile
      },
      onSelectTile: (tile) => {
        const world = worldRef.current
        selectedTileRef.current = world && world.inBounds(tile.x, tile.y) ? tile : null
      },
    })
    input.attach()

    let rafId
    let frameCount = 0
    let tickAccum = 0
    let lastFpsSample = performance.now()
    let visibleTiles = 0

    function loop(now) {
      tickAccum += gameLoop.advance(now)

      const world = worldRef.current
      const { width, height } = canvasSizeRef.current
      if (world && width > 0 && height > 0) {
        const range = drawFrame(ctx, world, cameraRef.current, width, height, hoverTileRef.current, selectedTileRef.current)
        visibleTiles = (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1)
      }

      frameCount++
      if (now - lastFpsSample >= 500) {
        const elapsedMs = now - lastFpsSample
        const fps = Math.round((frameCount * 1000) / elapsedMs)
        const tps = Math.round((tickAccum * 1000) / elapsedMs)
        frameCount = 0
        tickAccum = 0
        lastFpsSample = now
        setStats({ fps, tps, visibleTiles })
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      input.detach()
      resizeObserver.disconnect()
      unsubscribeUi()
      setEngineInstance(null)
    }
  }, [loading])

  return (
    <div ref={containerRef} className="ff-game-canvas">
      <canvas ref={canvasRef} className="ff-game-canvas__surface" />
      {loading && (
        <div className="ff-game-canvas__loading">
          <span>Generating world…</span>
        </div>
      )}
      {!loading && import.meta.env.DEV && <PerformanceMonitor stats={stats} />}
    </div>
  )
}
