// Nebula center is placed deep in space, far beyond Neptune
export const NEBULA_CENTER = [4000, 0, 0];
export const NEBULA_RADIUS = 800;          // Increased radius of the particle cloud
export const NEBULA_ENTRY_THRESHOLD = 500; // Distance at which nebula "fog" begins

// Mulberry32 seeded PRNG — deterministic positions across sessions
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const seededRandom = mulberry32(42);

// Procedurally generate 50 monoliths scattered within the nebula volume
export const monoliths = Array.from({ length: 50 }, (_, i) => {
  const r = NEBULA_RADIUS * Math.cbrt(seededRandom());
  const theta = seededRandom() * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * seededRandom() - 1.0);
  
  // Flatten the Y distribution slightly to match the nebula shape
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.4;
  const z = r * Math.cos(phi);
  
  return {
    id: `monolith-${i + 1}`,
    position: [NEBULA_CENTER[0] + x, NEBULA_CENTER[1] + y, NEBULA_CENTER[2] + z],
    rotation: [0, seededRandom() * Math.PI * 2, (seededRandom() - 0.5) * 0.2],
    scale: [10 + seededRandom() * 8, 16 + seededRandom() * 10, 0.8]
  };
});

// Waypoints for navigating through the nebula
export const nebulaWaypoints = [
  { id: 'wp-entry', position: [NEBULA_CENTER[0] - 300, 0, NEBULA_CENTER[2] - 300], label: 'Nebula Entry' },
  ...monoliths.map((m, i) => ({
    id: `wp-monolith${i + 1}`,
    position: m.position,
    label: `Gallery ${i + 1}`
  })),
  { id: 'wp-exit', position: [NEBULA_CENTER[0] + 500, 0, NEBULA_CENTER[2] + 500], label: 'Nebula Exit' },
];
