import { create } from 'zustand';

export const useStore = create((set) => ({
  hasSeenIntro: false,
  introComplete: false,
  setIntroComplete: () => set({ introComplete: true, hasSeenIntro: true }),

  showControlsHint: true,
  setShowControlsHint: (v) => set({ showControlsHint: v }),

  isFirstPerson: false,
  toggleFirstPerson: () => set((state) => ({ isFirstPerson: !state.isFirstPerson })),

  nearestPlanet: null,
  setNearestPlanet: (id) => set({ nearestPlanet: id }),

  timeScale: 1.0,
  setTimeScale: (val) => set({ timeScale: val }),

  relativityIntensity: 0.0,
  showConstellations: false,
  setShowConstellations: (show) => set({ showConstellations: show }),
  setRelativityIntensity: (val) => set({ relativityIntensity: val }),

  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    ascend: false,
    descend: false,
    boost: false,
  },
  setMovement: (key, value) => set((state) => ({
    movement: { ...state.movement, [key]: value }
  })),

  // Nebula region awareness
  inNebulaZone: false,
  setInNebulaZone: (v) => set({ inNebulaZone: v }),

  // Monolith gallery state
  activeMonolith: null,
  setActiveMonolith: (id) => set({ activeMonolith: id }),

  // NASA image cache
  nasaImages: [],
  setNasaImages: (imgs) => set({ nasaImages: imgs }),
  nasaImagesLoaded: false,
  setNasaImagesLoaded: (v) => set({ nasaImagesLoaded: v }),

  // Waypoint targeting
  targetWaypoint: null,
  setTargetWaypoint: (wp) => set({ targetWaypoint: wp }),

  // Performance Quality
  quality: 'high', // 'high' or 'low'
  setQuality: (q) => set({ quality: q }),

  // Camera ref for DOM-side components
  camera: null,
  setCamera: (cam) => set({ camera: cam }),
}));
