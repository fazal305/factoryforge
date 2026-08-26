import { useEffect, useRef, useState } from 'react'
import { createCamera } from '../../game/renderer/camera.js'
import { tileToIso } from '../../game/renderer/isoProjection.js'
import { drawFrame } from '../../game/renderer/CanvasRenderer.js'
import { invalidateColorCache } from '../../game/renderer/colorTokens.js'
import { InputController } from '../../game/input/InputController.js'
import { WorldGrid } from '../../game/world/WorldGrid.js'
import { GameLoop } from '../../game/engine/GameLoop.js'
import { SimulationState } from '../../game/simulation/SimulationState.js'
import { tickExtraction } from '../../game/simulation/tickExtraction.js'
import { tickProduction } from '../../game/simulation/tickProduction.js'
import { tickLogistics } from '../../game/simulation/tickLogistics.js'
import { tickInserters } from '../../game/simulation/tickInserters.js'
import { tickPower } from '../../game/simulation/tickPower.js'
import { tickResearch } from '../../game/simulation/tickResearch.js'
import { tickStatsSampler } from '../../game/systems/statsAggregator.js'
import { tickBottleneckDetector } from '../../game/systems/bottleneckDetector.js'
import { setEngineInstance } from '../../game/engine/engineInstance.js'
import { createPlaceCommand } from '../../game/engine/constructionCommands.js'
import { canPlaceBuilding } from '../../game/world/placement.js'
import { BUILDINGS } from '../../data/buildings.js'
import { useUiStore } from '../../state/uiStore.js'
import { deserializeSimulation } from '../../storage/saveGame.js'
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
 *
 * Passing `initialSave` (a validated save-data object) loads that game
 * instead of generating a fresh world — used for Load Game and Import
 * Save. App.jsx remounts this component (via a `key` bump in uiStore)
 * to start a new session, which is the simplest way to fully replace
 * the world/simulation/camera without threading a reset path through
 * every ref below.
 */
export default function GameCanvas({ initialSave }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const worldRef = useRef(null)
  const simulationRef = useRef(null)
  const loadedTimingRef = useRef(null)
  const cameraRef = useRef(createCamera())
  const hoverTileRef = useRef(null)
  const selectedTileRef = useRef(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ fps: 0, tps: 0, visibleTiles: 0 })

  useEffect(() => {
    if (initialSave) {
      const { simulation, simTime, tickCount } = deserializeSimulation(initialSave)
      worldRef.current = simulation.world
      simulationRef.current = simulation
      loadedTimingRef.current = { simTime, tickCount }
      const center = tileToIso(simulation.world.width / 2, simulation.world.height / 2)
      cameraRef.current.x = center.x
      cameraRef.current.y = center.y
      setLoading(false)
      return
    }

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
    // initialSave is only meaningful on first mount of a session (App
    // remounts this component with a new key for New Game/Load Game).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const simulation = simulationRef.current ?? new SimulationState(worldRef.current)
    simulationRef.current = simulation
    simulation.registerSystem(tickPower)
    simulation.registerSystem(tickExtraction)
    simulation.registerSystem(tickProduction)
    simulation.registerSystem(tickLogistics)
    simulation.registerSystem(tickInserters)
    simulation.registerSystem(tickResearch)
    simulation.registerSystem(tickStatsSampler)
    simulation.registerSystem(tickBottleneckDetector)
    const gameLoop = new GameLoop({ onTick: (dt) => simulation.runTick(dt) })
    if (loadedTimingRef.current) {
      gameLoop.tickCount = loadedTimingRef.current.tickCount
      gameLoop.simTimeSeconds = loadedTimingRef.current.simTime
    }
    const uiState = useUiStore.getState()
    gameLoop.setPaused(uiState.isPaused)
    gameLoop.setSpeed(uiState.simSpeed)
    const unsubscribeUi = useUiStore.subscribe((state) => {
      gameLoop.setPaused(state.isPaused)
      gameLoop.setSpeed(state.simSpeed)
    })
    const unsubscribePowerShortage = simulation.events.on('powerShortage', () => {
      useUiStore.getState().pushNotification({ tone: 'warning', message: 'Power grid overload — some machines are unpowered' })
    })
    const unsubscribeResearch = simulation.events.on('researchCompleted', (node) => {
      useUiStore.getState().pushNotification({ tone: 'success', message: `Research complete: ${node.name}` })
    })
    const unsubscribeItemProduced = simulation.events.on('itemProduced', ({ resourceId, qty }) => {
      const stats = simulation.stats
      stats.itemsProduced.set(resourceId, (stats.itemsProduced.get(resourceId) ?? 0) + qty)
    })
    const unsubscribeItemConsumed = simulation.events.on('itemConsumed', ({ resourceId, qty }) => {
      const stats = simulation.stats
      stats.itemsConsumed.set(resourceId, (stats.itemsConsumed.get(resourceId) ?? 0) + qty)
    })
    setEngineInstance({ simulation, gameLoop })

    const input = new InputController(canvas, cameraRef.current, {
      getCanvasSize: () => canvasSizeRef.current,
      onHoverTile: (tile) => {
        hoverTileRef.current = tile
      },
      onSelectTile: (tile) => {
        const world = worldRef.current
        if (!world || !world.inBounds(tile.x, tile.y)) {
          selectedTileRef.current = null
          return
        }

        const ui = useUiStore.getState()

        if (ui.selectedBuildingId) {
          const { valid, reason } = canPlaceBuilding(simulation, ui.selectedBuildingId, tile.x, tile.y, ui.placementRotation)
          if (valid) {
            simulation.history.execute(createPlaceCommand(simulation, ui.selectedBuildingId, tile.x, tile.y, ui.placementRotation))
            ui.pushNotification({ tone: 'success', message: `${BUILDINGS[ui.selectedBuildingId].name} placed` })
          } else {
            ui.pushNotification({ tone: 'warning', message: reason })
          }
          selectedTileRef.current = null
          return
        }

        const buildingId = world.buildingId[world.index(tile.x, tile.y)]
        if (buildingId !== -1) {
          ui.selectEntity(buildingId)
          selectedTileRef.current = null
        } else {
          ui.selectEntity(null)
          selectedTileRef.current = tile
        }
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

      const { width, height } = canvasSizeRef.current
      if (width > 0 && height > 0) {
        const ui = useUiStore.getState()
        const buildMode = ui.selectedBuildingId
          ? { typeId: ui.selectedBuildingId, rotation: ui.placementRotation }
          : null
        const range = drawFrame(
          ctx,
          simulation,
          cameraRef.current,
          width,
          height,
          hoverTileRef.current,
          selectedTileRef.current,
          buildMode,
          ui.selectedEntityId,
        )
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
      unsubscribePowerShortage()
      unsubscribeResearch()
      unsubscribeItemProduced()
      unsubscribeItemConsumed()
      setEngineInstance(null)
    }
  }, [loading])

  return (
    <div ref={containerRef} className="ff-game-canvas">
      <canvas ref={canvasRef} className="ff-game-canvas__surface" />
      {loading && (
        <div className="ff-game-canvas__loading">
          <span>{initialSave ? 'Loading save…' : 'Generating world…'}</span>
        </div>
      )}
      {!loading && import.meta.env.DEV && <PerformanceMonitor stats={stats} />}
    </div>
  )
}
