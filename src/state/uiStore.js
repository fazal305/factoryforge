import { create } from 'zustand'

/**
 * UI-facing application state only: panels, selection, build mode, and
 * settings. High-frequency simulation data never lives here — see
 * game/simulation/SimulationState.js and hooks/useSimulationSnapshot.js
 * for how the engine's world state is bridged into React sparingly.
 */

export const SIM_SPEEDS = [0.5, 1, 2, 4]

export const PANEL = {
  NONE: null,
  STATS: 'stats',
  RESEARCH: 'research',
  SETTINGS: 'settings',
  SHORTCUTS: 'shortcuts',
}

export const useUiStore = create((set, get) => ({
  // --- simulation transport controls (read by the engine loop) ---
  isPaused: false,
  simSpeed: 1,

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  setSimSpeed: (speed) => set({ simSpeed: speed, isPaused: false }),

  // --- build mode ---
  activeBuildCategory: null,
  selectedBuildingId: null,
  placementRotation: 0,

  setActiveBuildCategory: (category) =>
    set((s) => ({
      activeBuildCategory: s.activeBuildCategory === category ? null : category,
      selectedBuildingId: null,
    })),
  selectBuildingForPlacement: (buildingId) =>
    set({ selectedBuildingId: buildingId, placementRotation: 0 }),
  rotatePlacement: () => set((s) => ({ placementRotation: (s.placementRotation + 90) % 360 })),
  cancelBuildMode: () =>
    set({ activeBuildCategory: null, selectedBuildingId: null, placementRotation: 0 }),

  // --- selection / inspector ---
  selectedEntityId: null,
  selectEntity: (entityId) => set({ selectedEntityId: entityId }),
  clearSelection: () => set({ selectedEntityId: null }),

  // --- side panels ---
  activePanel: PANEL.NONE,
  openPanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? PANEL.NONE : panel })),
  closePanel: () => set({ activePanel: PANEL.NONE }),

  // --- settings ---
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.6,
    reducedMotion: false,
  },
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  // --- notifications (toasts) ---
  notifications: [],
  pushNotification: (notification) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { id: crypto.randomUUID(), tone: 'info', ...notification },
      ],
    })),
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  // --- helper used by build-mode consumers ---
  isInBuildMode: () => Boolean(get().selectedBuildingId),
}))
