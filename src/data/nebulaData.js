// Nebula center is placed deep in space, far beyond Neptune
export const NEBULA_CENTER = [1610, 35, 1565];
export const NEBULA_RADIUS = 800;          // Increased radius of the particle cloud
export const NEBULA_ENTRY_THRESHOLD = 500; // Distance at which nebula "fog" begins

// Procedurally generate 50 monoliths scattered within the nebula volume
export const monoliths = Array.from({ length: 50 }, (_, i) => {
  const r = NEBULA_RADIUS * Math.cbrt(Math.random());
  const theta = Math.random() * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * Math.random() - 1.0);
  
  // Flatten the Y distribution slightly to match the nebula shape
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.4;
  const z = r * Math.cos(phi);
  
  return {
    id: `monolith-${i + 1}`,
    position: [NEBULA_CENTER[0] + x, NEBULA_CENTER[1] + y, NEBULA_CENTER[2] + z],
    rotation: [0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2],
    scale: [10 + Math.random() * 8, 16 + Math.random() * 10, 0.8]
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
