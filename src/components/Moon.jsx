import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Moon({ data }) {
  const moonRef = useRef();

  useFrame(({ clock }) => {
    if (moonRef.current) {
      // Tidally locked or slow rotation
      moonRef.current.rotation.y += 0.01;
      
      // Orbit around the parent planet
      const time = clock.elapsedTime;
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
