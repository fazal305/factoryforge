# FactoryForge

Isometric automation & logistics simulator built with React + Canvas 2D.

> Status: early scaffold. Full README (concept, architecture, controls, roadmap) lands once core systems are in place.

## Development

```bash
npm install
npm run dev
```

## Stack

- Vite + React (JavaScript/JSX, no TypeScript)
- Canvas 2D rendering, engine-driven (not React-driven) simulation loop
- Zustand for UI state
- IndexedDB for save/load
- Web Worker for procedural world generation
