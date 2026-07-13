import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { planets } from '../data/planets';
import { getOrbitPosition } from '../utils/orbits';

const PROXIMITY_THRESHOLD = 30; // Distance at which UI triggers

export function useProximity(targetRef) {
  const setNearestPlanet = useStore((state) => state.setNearestPlanet);
  const currentNearest = useRef(null);
  const astronautPos = useRef(new THREE.Vector3());
  const planetPosRef = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    if (!targetRef.current) return;

    targetRef.current.getWorldPosition(astronautPos.current);

    let closestPlanet = null;
    let minDistance = Infinity;

    for (const planet of planets) {
      getOrbitPosition(planet.position, clock.elapsedTime, planetPosRef.current);
      const distance = astronautPos.current.distanceTo(planetPosRef.current);
      
      // Calculate distance relative to the planet's surface
      const distanceToSurface = distance - planet.radius;

      if (distanceToSurface < PROXIMITY_THRESHOLD && distanceToSurface < minDistance) {
        closestPlanet = planet.id;
        minDistance = distanceToSurface;
      }
    }

    if (currentNearest.current !== closestPlanet) {
      currentNearest.current = closestPlanet;
      setNearestPlanet(closestPlanet);
    }
  });
}
