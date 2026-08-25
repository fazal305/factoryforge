/** Shared caps used across the production and logistics systems. */

// Max units of a single resource a machine's input/output buffer or a
// storage chest can hold. Real per-item stack limits arrive with the
// full inventory system (Step 10) — this is a flat placeholder cap.
export const BUFFER_CAP = 50

// Minimum belt-space (in tile-lengths) kept between two items on the
// same conveyor so they never visually overlap.
export const ITEM_SPACING = 0.3

export const BELT_TYPES = new Set(['conveyor', 'undergroundConveyor'])
