# FactoryForge

**Isometric Automation & Logistics Simulator** — a browser-based factory-building game built from scratch in React, with a custom simulation engine and an isometric Canvas 2D renderer underneath it.

Inspired by the automation/logistics genre (Factorio and its relatives), but original throughout: its own mechanics, its own visual identity, its own engine. Nothing here is copied branding, art, or UI.

---

## Table of contents

- [Concept & gameplay](#concept--gameplay)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Simulation engine](#simulation-engine)
- [Rendering architecture](#rendering-architecture)
- [State management](#state-management)
- [Performance](#performance)
- [Save system](#save-system)
- [Controls](#controls)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [Known limitations](#known-limitations)

---

## Concept & gameplay

You land on a procedurally generated island. The core loop:

```
RESOURCE DEPOSIT → MINING DRILL → CONVEYOR → FURNACE → PLATE
    → CONVEYOR → ASSEMBLER → MACHINE PARTS → STORAGE / RESEARCH
```

Concretely, a player:

1. **Explores** a large procedurally generated world (value-noise terrain, seeded ore/coal/stone deposits).
2. **Mines** raw resources with drills placed directly on a deposit.
3. **Transports** items via conveyor belts and inserters — belts move items realistically (they back up at dead ends instead of teleporting), inserters are the only way to get an item off a belt and into a machine.
4. **Processes** raw ore into plates (furnaces) and combines plates into gears, circuits, and machine parts (assemblers), all driven by a data-driven recipe system.
5. **Manages power** — generators burn coal into a shared grid that forms automatically by pole proximity; machines without enough supply simply stop, with the Inspector telling you why.
6. **Researches** a short tech tree that unlocks new buildings, recipes, and a mining-speed upgrade.
7. **Monitors** the factory via a real statistics dashboard (production-rate charts, machine utilization, lifetime totals) and an automatic bottleneck detector that names the exact building and suggests a fix.
8. **Saves, loads, exports, and imports** the whole factory via IndexedDB and portable JSON files.

Every building, resource, recipe, and research node is plain data (`src/data/`) — none of it is hardcoded into component logic.

## Screenshots

_Not yet captured — the project has been built and verified through code-level testing and headless browser automation. Add screenshots here once you've played a session._

## Architecture

```
src/
├── app/            React shell (App.jsx) — HUD, panels, canvas composition
├── components/     UI only: hud/, build/, inspector/, stats/, research/, settings/, world/, common/
├── data/           Pure data: buildings.js, resources.js, recipes.js, research.js
├── game/
│   ├── engine/     GameLoop (fixed timestep), EventBus, CommandHistory, engineInstance singleton
│   ├── simulation/ SimulationState, Inventory, and every tickX.js system
│   ├── systems/    statsAggregator.js, bottleneckDetector.js
│   ├── world/      WorldGrid, worldGen (value noise), placement validation, directions
│   ├── entities/   Building factory, footprint math
│   ├── renderer/   Camera, iso projection, viewport culling, CanvasRenderer + layers/
│   └── input/      InputController (pointer/wheel → camera + placement)
├── hooks/          useKeyboardShortcuts, useSimulationSnapshot (engine → React bridge)
├── state/          uiStore.js (Zustand) — UI-only state, documented boundary below
├── storage/        db.js (IndexedDB), saveGame.js (serialize/validate), importExport.js
├── workers/        worldGen.worker.js — world generation off the main thread
└── styles/         tokens.css (design tokens), global.css
```

Nothing in `game/` imports React. The boundary is [`GameCanvas.jsx`](src/components/world/GameCanvas.jsx): it owns the canvas element, the camera, the worker, and the engine instance, and is the only place React and the simulation touch each other directly.

## Simulation engine

The engine is intentionally **not** driven by React's render cycle.

- **[`GameLoop.js`](src/game/engine/GameLoop.js)** is a fixed-timestep accumulator: 20 ticks/sec at 1× speed. Every tick advances the world by exactly the same amount of simulated time — speed controls (0.5×–4×) change how many ticks run per real second, never how much a single tick does, so production math stays deterministic regardless of frame rate. Catch-up after a stalled frame is capped at 8 ticks so a backgrounded tab can't try to replay minutes of missed ticks at once.
- **[`SimulationState.js`](src/game/simulation/SimulationState.js)** holds the world, the building list, inventories, power/research state, and a **systems pipeline** — plain `(simulation, dt) => void` functions registered once and run in order every tick:

  ```
  tickPower → tickExtraction → tickProduction → tickLogistics
    → tickInserters → tickResearch → tickStatsSampler → tickBottleneckDetector
  ```

  Each system is one file, one concern. Adding a new mechanic means adding a new system, not threading a conditional through existing ones.
- **[`EventBus.js`](src/game/engine/EventBus.js)** decouples systems from the UI: `tickPower` emits `powerShortage`, `tickResearch` emits `researchCompleted`, `tickExtraction`/`tickProduction` emit `itemProduced`/`itemConsumed`. `GameCanvas` subscribes to these once and turns them into toasts or stats — the systems themselves never import a UI module.
- **[`CommandHistory.js`](src/game/engine/CommandHistory.js)** — undo/redo, but only for user construction actions (place/remove a building), never for simulation ticks. Commands are composed from granular primitives (`writeFootprint`/`clearFootprint`, `deductCost`/`refundCost`) so undo restores the *exact same entity*, not a recreation with a new id.

## Rendering architecture

**Canvas 2D**, not React Three Fiber or raw WebGL — a deliberate choice made before writing any renderer code. A 2D isometric tile game doesn't need a 3D scene graph; Canvas 2D gives full control over batching and culling with far less complexity than a WebGL pipeline, at a fraction of the bundle size.

- [`isoProjection.js`](src/game/renderer/isoProjection.js): 2:1 tile↔iso transforms.
- [`camera.js`](src/game/renderer/camera.js): a **plain mutable object**, not React state — pan/zoom (cursor-anchored) mutate it directly every frame; routing it through `useState` would mean a re-render per pixel of drag.
- [`viewportCulling.js`](src/game/renderer/viewportCulling.js): projects the four screen corners back into tile space and only iterates that bounding box — render cost scales with what's on screen, not with world size.
- [`CanvasRenderer.js`](src/game/renderer/CanvasRenderer.js) composes six layers in order: terrain → resource deposits → buildings → belts/items/inserter arrows → power-range ring (selected pole only) → placement ghost → hover/selection outline.
- [`GameCanvas.jsx`](src/components/world/GameCanvas.jsx) owns one `requestAnimationFrame` loop that both advances the engine (`gameLoop.advance(now)`) and draws a frame — a single driver, with the fixed-timestep engine and the variable-rate renderer cleanly decoupled inside it.

## State management

Two deliberately separate stores, for different reasons:

| | Lives in | Why |
|---|---|---|
| UI state (selection, build mode, panels, settings) | **Zustand** (`state/uiStore.js`) | Changes at human speed; React re-rendering it is correct and cheap. |
| Simulation state (buildings, inventories, power, research) | **Plain mutable objects** (`SimulationState`) | Mutates 20×/sec; routing that through React state would mean a re-render per tick for data nothing in the component tree needs at that frequency. |

The bridge is [`useSimulationSnapshot.js`](src/hooks/useSimulationSnapshot.js): a hook that **polls** the engine on an interval (250–500ms depending on the panel) rather than subscribing per-tick, and expects the selector to return a **fresh object/array each call** — several UI bugs during development traced back to a selector returning the same mutated-in-place reference, which React can't tell apart from "unchanged."

## Performance

Two concrete, measured decisions (not guesses):

- **`tickPower` throttling.** Stress-testing at 2000 buildings (500 power poles) showed `tickPower` alone costing ~43ms/tick — the *entire* 50ms budget at 20 TPS — because it recomputed the full pole-network topology (an O(poles²) union-find pass) unconditionally every tick. Power topology only actually changes when a building is placed or removed, so the recompute is now throttled to twice a second (with elapsed-time accounting so fuel-burn timing stays exact). Result: ~2.5ms/tick at the same scale, a 17× reduction.
- **Viewport culling** everywhere it matters: the terrain/resource layers never touch a tile outside the visible range regardless of world size (tested at 96×96 and larger); `drawFrame` measured at ~6.6ms/frame with 1500 buildings on screen, comfortably inside the 16.7ms budget for 60fps.

A dev-only overlay ([`PerformanceMonitor.jsx`](src/components/world/PerformanceMonitor.jsx), visible in `npm run dev`) shows live FPS, simulation TPS, visible-tile count, entity count, and active-machine count.

## Save system

- **[`storage/db.js`](src/storage/db.js)** — a thin IndexedDB wrapper (one object store, keyed by save name).
- **[`storage/saveGame.js`](src/storage/saveGame.js)** — serializes a live `SimulationState` + `GameLoop` into plain JSON: the world grid as arrays, every building with its `Inventory` buffers flattened to `[resourceId, qty]` pairs, research progress, and simulation timing. Storage chests share one `Inventory` instance between input and output; serialization records that and reconnects it on load, rather than silently splitting it into two out-of-sync buffers. `validateSaveData` checks structure and array sizing *before* anything touches the engine, so a malformed file fails loudly instead of half-loading.
- **[`storage/importExport.js`](src/storage/importExport.js)** — a real file download for export, a `FileReader` + the same validation path for import.
- **New Game / Load Game** both work by bumping a `worldEpoch` counter used as `GameCanvas`'s React `key` — remounting it is the simplest correct way to fully replace the world/simulation/camera without threading a reset path through every internal ref.

All of it is reachable from **Settings** (⚙ in the HUD): named saves with a load/delete list, Export Save, Import Save, and New Game.

## Controls

**Mouse:** drag to pan, scroll to zoom (cursor-anchored), click a tile to select a building or place the armed one.

**Keyboard:**

| Key | Action |
|---|---|
| `Space` | Pause / resume |
| `R` | Rotate building (while placing) |
| `Esc` | Cancel placement |
| `Delete` / `Backspace` | Remove selected building |
| `U` | Undo last construction action |
| `Ctrl`/`Cmd` + `Shift` + `Z` | Redo |
| `?` | Toggle the in-game shortcuts help |

## Development setup

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview a production build locally
```

No environment variables are required — see [`.env.example`](.env.example).

## Project structure

See [Architecture](#architecture) above for the annotated tree. Two folders from the original plan — `src/services/` and `src/utils/` — exist but are currently empty; see [Known limitations](#known-limitations).

## Roadmap

- **True underground conveyor pairing.** Underground conveyors are currently placeable and functional but behave as a plain belt segment — they don't yet find and teleport items to a paired exit further down the line.
- **Minimap.** Listed as optional in the original design; not built.
- **Procedural audio.** A `services/audio.js` Web Audio synth was planned (sound effects/music toggles already exist in Settings and do nothing yet) but not implemented.
- **Multi-slot inventory UI.** Buffers currently track one numeric total per resource (capacity-checked via `Inventory`), not a visual multi-slot grid.
- **Deployment.** Not yet deployed to any host; ask before choosing one (Vercel/Netlify/GitHub Pages all fit this static Vite build).
- **More of the research tree / recipe depth** beyond the current 5-node chain and 6 recipes, once the above is solid.

## Known limitations

- **Underground conveyors** don't implement real teleport pairing yet (see Roadmap) — this is stated in the building's own in-game description, not hidden.
- **No audio** — toggles exist in Settings but are inert.
- **No minimap.**
- **Statistics/bottleneck data don't persist across save/load** — they're derived, session-local counters (reset to zero on load), not authoritative game state. Building/inventory/research state does persist fully.
- **Live FPS could not be measured in this project's own automated browser-testing sandbox** — that specific tool reports the tab as `document.hidden`, which suspends `requestAnimationFrame` regardless of viewport size. Performance claims above come from direct Node.js benchmarking of the simulation systems and the render function's per-call cost instead, which is arguably the more rigorous measurement — but a real in-browser FPS check is worth doing yourself.
- **Camera/build controls are mouse-only** — no keyboard-driven camera pan or tile cursor, so the world view itself isn't fully keyboard-operable (all UI chrome — HUD, panels, toolbar — is).
