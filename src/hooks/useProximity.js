import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { planets } from '../data/planets';
import { getOrbitPosition } from '../utils/orbits';
import { gameTime } from '../utils/gameTime';

const PROXIMITY_THRESHOLD = 30; // Distance at which UI triggers

export function useProximity(targetRef) {
  const setNearestPlanet = useStore((state) => state.setNearestPlanet);
  const currentNearest = useRef(null);
  const astronautPos = useRef(new THREE.Vector3());
  const planetPosRef = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!targetRef.current) return;

    targetRef.current.getWorldPosition(astronautPos.current);

    let closestPlanet = null;
    let minDistance = Infinity;

    for (const planet of planets) {
      getOrbitPosition(planet.position, gameTime.elapsed, planetPosRef.current);
      const distance = astronautPos.current.distanceTo(planetPosRef.current);
      
      // Calculate distance relative to the planet's surface
      const distanceToSurface = distance - planet.radius;

      if (distanceToSurface < PROXIMITY_THRESHOLD && distanceToSurface < minDistance) {
        closestPlanet = planet.id;
        minDistance = distanceToSurface;
      }
    }

    // Check static POIs proximity
    const staticPOIs = [
      { id: 'sun', position: [0, 0, 0], radius: 32.5, triggerDistance: 200 },
      { id: 'isro-spaceship', position: [0, 0, 2000], radius: 15, triggerDistance: 100 },
      { id: 'voyager', position: [3000, -500, -2000], radius: 10, triggerDistance: 100 },
      { id: 'pulsar-01', position: [6000, 1500, -6000], radius: 40, triggerDistance: 1500 },
      { id: 'supernova-01', position: [-5000, -2000, -7000], radius: 900, triggerDistance: 1500 }
    ];

    for (const poi of staticPOIs) {
      const poiPos = new THREE.Vector3(...poi.position);
      const dist = astronautPos.current.distanceTo(poiPos) - poi.radius;
      const threshold = poi.triggerDistance || PROXIMITY_THRESHOLD;
      if (dist < threshold && dist < minDistance) {
        closestPlanet = poi.id;
        minDistance = dist;
      }
    }

    if (currentNearest.current !== closestPlanet) {
      currentNearest.current = closestPlanet;
      setNearestPlanet(closestPlanet);
    }
  });
}
