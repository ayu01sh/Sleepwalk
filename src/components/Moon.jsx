import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { gameTime } from '../utils/gameTime';

export default function Moon({ data }) {
  const moonRef = useRef();

  useFrame((state, delta) => {
    if (moonRef.current) {
      const timeScale = useStore.getState().timeScale;
      // Tidally locked or slow rotation
      moonRef.current.rotation.y += 0.01 * timeScale * 60 * delta;
      
      // Orbit around the parent planet
      const time = gameTime.elapsed;
      const angle = time * data.orbitSpeed;
      moonRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      moonRef.current.position.z = Math.sin(angle) * data.orbitRadius;
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[data.radius, 32, 32]} />
      <meshStandardMaterial color={data.color || '#cccccc'} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}
