import { create } from 'zustand';

export const useStore = create((set) => ({
  hasSeenIntro: false,
  introComplete: false,
  setIntroComplete: () => set({ introComplete: true, hasSeenIntro: true }),

  showControlsHint: false,
  setShowControlsHint: (v) => set({ showControlsHint: v }),

  nearestPlanet: null,
  setNearestPlanet: (id) => set({ nearestPlanet: id }),
}));
