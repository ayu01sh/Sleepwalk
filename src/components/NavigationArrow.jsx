import { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { planets } from '../data/planets';
import { monoliths } from '../data/nebulaData';
import { BLACK_HOLE_POSITION } from './BlackHole';

export default function NavigationArrow({ astronautRef }) {
  const arrowGroup = useRef();
  const { camera } = useThree();
  
  // Pre-calculate all target positions
  const targets = useMemo(() => {
    const list = [];
    planets.forEach(p => {
      list.push(new THREE.Vector3(...p.position));
    });
    monoliths.forEach(m => {
      list.push(new THREE.Vector3(...m.position));
    });
    list.push(new THREE.Vector3(...BLACK_HOLE_POSITION));
    return list;
  }, []);

  useFrame(() => {
    if (!astronautRef.current || !arrowGroup.current) return;
    
    const astroPos = astronautRef.current.position;
    
    // Find closest target
    let closestTarget = null;
    let minDistanceSq = Infinity;
    
    for (let i = 0; i < targets.length; i++) {
      const distSq = astroPos.distanceToSquared(targets[i]);
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestTarget = targets[i];
      }
    }
    
    if (closestTarget) {
      // Calculate exactly where the top right corner is at z = -3 for any aspect ratio
      const dist = 3;
      const vFov = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFov / 2) * dist;
      const width = height * camera.aspect;
      
      // Position it in the top right corner with a small margin
      const margin = 0.3;
      arrowGroup.current.position.set((width / 2) - margin, (height / 2) - margin, -dist);
      arrowGroup.current.position.applyMatrix4(camera.matrixWorld);
      
      // Orient the arrow toward the closest target
      arrowGroup.current.lookAt(closestTarget);
    }
  });

  return (
    <group ref={arrowGroup}>
      {/* HUD Arrow: unlit (meshBasicMaterial) so it doesn't get affected by Bloom or shadows */}
      <group scale={[0.1, 0.1, 0.1]}>
        {/* Shaft */}
        <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
        
        {/* Tip */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color="#ff3333" />
        </mesh>
      </group>
    </group>
  );
}
