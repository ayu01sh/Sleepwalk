import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { NEBULA_CENTER, NEBULA_ENTRY_THRESHOLD, monoliths, nebulaWaypoints } from '../data/nebulaData';

export function useNebulaProximity(targetRef) {
  const setInNebulaZone = useStore((state) => state.setInNebulaZone);
  const setActiveMonolith = useStore((state) => state.setActiveMonolith);
  const targetWaypoint = useStore((state) => state.targetWaypoint);
  const setTargetWaypoint = useStore((state) => state.setTargetWaypoint);
  
  const currentZone = useRef(false);
  const currentActiveMonolith = useRef(null);
  const astronautPos = useRef(new THREE.Vector3());
  const nebulaCenterPos = new THREE.Vector3(...NEBULA_CENTER);

  // Initialize waypoint if null and inside zone, allow manual cycling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'n' || e.key === 'N') {
        const state = useStore.getState();
        if (!state.inNebulaZone) return;
        
        let nextIndex = 0;
        if (state.targetWaypoint) {
          const currentIndex = nebulaWaypoints.findIndex(wp => wp.id === state.targetWaypoint.id);
          nextIndex = (currentIndex + 1) % nebulaWaypoints.length;
        }
        setTargetWaypoint(nebulaWaypoints[nextIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTargetWaypoint]);

  useFrame(() => {
    if (!targetRef.current) return;

    targetRef.current.getWorldPosition(astronautPos.current);

    // 1. Nebula Zone Check
    const distToNebula = astronautPos.current.distanceTo(nebulaCenterPos);
    const isInsideNebula = distToNebula < NEBULA_ENTRY_THRESHOLD;
    
    if (currentZone.current !== isInsideNebula) {
      currentZone.current = isInsideNebula;
      setInNebulaZone(isInsideNebula);
      
      // Auto-assign first waypoint on entry
      if (isInsideNebula && !useStore.getState().targetWaypoint) {
        setTargetWaypoint(nebulaWaypoints[0]);
      }
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

    // 3. Auto-advance waypoints
    const wpState = useStore.getState().targetWaypoint;
    if (wpState) {
      const wpPos = new THREE.Vector3(...wpState.position);
      if (astronautPos.current.distanceTo(wpPos) < 50) {
        const currentIndex = nebulaWaypoints.findIndex(wp => wp.id === wpState.id);
        if (currentIndex !== -1 && currentIndex < nebulaWaypoints.length - 1) {
          setTargetWaypoint(nebulaWaypoints[currentIndex + 1]);
        } else if (currentIndex === nebulaWaypoints.length - 1) {
          setTargetWaypoint(null); // Reached end
        }
      }
    }
  });
}
