import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { NEBULA_CENTER, NEBULA_ENTRY_THRESHOLD, monoliths } from '../data/nebulaData';

export function useNebulaProximity(targetRef) {
  const setInNebulaZone = useStore((state) => state.setInNebulaZone);
  const setActiveMonolith = useStore((state) => state.setActiveMonolith);
  
  const currentZone = useRef(false);
  const currentActiveMonolith = useRef(null);
  const astronautPos = useRef(new THREE.Vector3());
  const nebulaCenterPos = new THREE.Vector3(...NEBULA_CENTER);



  useFrame(() => {
    if (!targetRef.current) return;

    targetRef.current.getWorldPosition(astronautPos.current);

    // 1. Nebula Zone Check
    const distToNebula = astronautPos.current.distanceTo(nebulaCenterPos);
    const isInsideNebula = distToNebula < NEBULA_ENTRY_THRESHOLD;
    
    if (currentZone.current !== isInsideNebula) {
      currentZone.current = isInsideNebula;
      setInNebulaZone(isInsideNebula);
    }

    if (!isInsideNebula) {
      if (currentActiveMonolith.current !== null) {
        currentActiveMonolith.current = null;
        setActiveMonolith(null);
      }
      return; // Save computation if not in nebula
    }

    // 2. Monolith Proximity Check
    let closestMonolith = null;
    let minDistance = Infinity;

    for (const monolith of monoliths) {
      const monolithPos = new THREE.Vector3(...monolith.position);
      const dist = astronautPos.current.distanceTo(monolithPos);
      if (dist < 40 && dist < minDistance) {
        closestMonolith = monolith.id;
        minDistance = dist;
      }
    }

    if (currentActiveMonolith.current !== closestMonolith) {
      currentActiveMonolith.current = closestMonolith;
      setActiveMonolith(closestMonolith);
    }


  });
}
