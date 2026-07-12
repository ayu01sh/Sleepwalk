// Nebula center is placed ~400 units beyond Neptune
export const NEBULA_CENTER = [1100, 50, 900];
export const NEBULA_RADIUS = 350;          // Radius of the particle cloud
export const NEBULA_ENTRY_THRESHOLD = 500; // Distance at which nebula "fog" begins

// Monolith gallery positions — arranged in a loose spiral within the nebula
export const monoliths = [
  { id: 'monolith-1', position: [950, 30, 800],   rotation: [0, 0.3, 0],  scale: [12, 20, 0.8] },
  { id: 'monolith-2', position: [1050, -20, 950],  rotation: [0, -0.5, 0.05], scale: [14, 22, 0.8] },
  { id: 'monolith-3', position: [1150, 60, 850],   rotation: [0, 1.2, 0],  scale: [10, 18, 0.8] },
  { id: 'monolith-4', position: [1200, -10, 1000],  rotation: [0, -0.8, 0.1], scale: [16, 24, 0.8] },
  { id: 'monolith-5', position: [1100, 40, 1050],  rotation: [0, 0.6, -0.05], scale: [11, 19, 0.8] },
  { id: 'monolith-6', position: [1000, -30, 1000], rotation: [0, 2.1, 0],  scale: [13, 21, 0.8] },
  { id: 'monolith-7', position: [900, 10, 1050], rotation: [0, -1.1, 0.05], scale: [12, 19, 0.8] },
  { id: 'monolith-8', position: [1250, 45, 900], rotation: [0, 0.4, -0.05], scale: [15, 23, 0.8] },
  { id: 'monolith-9', position: [1000, 70, 750], rotation: [0, 1.5, 0], scale: [11, 18, 0.8] },
  { id: 'monolith-10', position: [1150, -40, 1100], rotation: [0, -0.2, 0.1], scale: [14, 25, 0.8] },
  { id: 'monolith-11', position: [1300, 20, 1000], rotation: [0, 0.9, -0.1], scale: [13, 20, 0.8] },
  { id: 'monolith-12', position: [950, -50, 1150], rotation: [0, -1.8, 0], scale: [12, 22, 0.8] },
  { id: 'monolith-13', position: [1050, 80, 1200], rotation: [0, 0.3, 0.1], scale: [16, 21, 0.8] },
  { id: 'monolith-14', position: [1250, -60, 1050], rotation: [0, 2.5, -0.1], scale: [10, 17, 0.8] },
  { id: 'monolith-15', position: [1400, 30, 950], rotation: [0, -0.6, 0.05], scale: [15, 24, 0.8] },
  { id: 'monolith-16', position: [1350, -20, 850], rotation: [0, 1.1, 0], scale: [13, 19, 0.8] },
  { id: 'monolith-17', position: [1450, 10, 1100], rotation: [0, -0.3, -0.05], scale: [14, 23, 0.8] },
];

// Waypoints for navigating through the nebula (ordered path)
export const nebulaWaypoints = [
  { id: 'wp-entry',     position: [850, 0, 700],    label: 'Nebula Entry' },
  { id: 'wp-monolith1', position: [950, 30, 800],   label: 'Gallery I' },
  { id: 'wp-monolith2', position: [1050, -20, 950], label: 'Gallery II' },
  { id: 'wp-monolith3', position: [1150, 60, 850],  label: 'Gallery III' },
  { id: 'wp-monolith4', position: [1200, -10, 1000], label: 'Gallery IV' },
  { id: 'wp-monolith5', position: [1100, 40, 1050], label: 'Gallery V' },
  { id: 'wp-monolith6', position: [1000, -30, 1000], label: 'Gallery VI' },
  { id: 'wp-monolith7', position: [900, 10, 1050], label: 'Gallery VII' },
  { id: 'wp-monolith8', position: [1250, 45, 900], label: 'Gallery VIII' },
  { id: 'wp-monolith9', position: [1000, 70, 750], label: 'Gallery IX' },
  { id: 'wp-monolith10', position: [1150, -40, 1100], label: 'Gallery X' },
  { id: 'wp-monolith11', position: [1300, 20, 1000], label: 'Gallery XI' },
  { id: 'wp-monolith12', position: [950, -50, 1150], label: 'Gallery XII' },
  { id: 'wp-monolith13', position: [1050, 80, 1200], label: 'Gallery XIII' },
  { id: 'wp-monolith14', position: [1250, -60, 1050], label: 'Gallery XIV' },
  { id: 'wp-monolith15', position: [1400, 30, 950], label: 'Gallery XV' },
  { id: 'wp-monolith16', position: [1350, -20, 850], label: 'Gallery XVI' },
  { id: 'wp-monolith17', position: [1450, 10, 1100], label: 'Gallery XVII' },
  { id: 'wp-exit',      position: [1550, 0, 1300],  label: 'Nebula Exit' },
];
