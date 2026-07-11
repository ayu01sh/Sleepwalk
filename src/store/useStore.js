import { create } from 'zustand';

export const useStore = create((set) => ({
  hasSeenIntro: false,
  introComplete: false,
  setIntroComplete: () => set({ introComplete: true, hasSeenIntro: true }),

  showControlsHint: false,
  setShowControlsHint: (v) => set({ showControlsHint: v }),

  nearestPlanet: null,
  setNearestPlanet: (id) => set({ nearestPlanet: id }),

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
}));
