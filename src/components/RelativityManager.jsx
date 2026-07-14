import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { BLACK_HOLE_POSITION } from './BlackHole';

const MAX_AFFECT_DISTANCE = 700;
const MIN_DISTANCE = 500; // Event horizon proxy

export default function RelativityManager({ astronautRef }) {
  const { camera } = useThree();
  const bhPos = new THREE.Vector3(...BLACK_HOLE_POSITION);

  // Store the base FOV
  const BASE_FOV = 60;

  useFrame(() => {
    if (!astronautRef?.current) return;
    
    const dist = astronautRef.current.position.distanceTo(bhPos);
    
    // Calculate relativity intensity (0 = normal space, 1 = event horizon)
    let intensity = 0;
    if (dist < MAX_AFFECT_DISTANCE) {
      // Non-linear intensity curve (gets extreme very quickly near the end)
      const normalizedDist = Math.max(0, (dist - MIN_DISTANCE) / (MAX_AFFECT_DISTANCE - MIN_DISTANCE));
      intensity = 1.0 - Math.pow(normalizedDist, 2.0); // Curve
    }
    
    // Safety clamp
    intensity = Math.max(0, Math.min(0.99, intensity));

    // DEBUG: Print occasionally (every ~60 frames)
    if (Math.random() < 0.02) {
      console.log(`Relativity Debug: dist=${dist.toFixed(2)}, intensity=${intensity.toFixed(3)}`);
    }

    // Update global store
    useStore.getState().setRelativityIntensity(intensity);
    
    // Time Dilation: Time slows down as you approach the black hole
    // At intensity 0 -> timeScale = 1.0
    // At intensity 0.99 -> timeScale ~ 0.05
    const timeScale = Math.max(0.05, 1.0 - intensity);
    useStore.getState().setTimeScale(timeScale);

    // FOV Stretching (Gravitational Lensing approximation via Camera FOV)
    // As space stretches, the field of view dramatically widens.
    camera.fov = BASE_FOV + (intensity * 80); // max FOV of 140
    camera.updateProjectionMatrix();
  });

  return null;
}
