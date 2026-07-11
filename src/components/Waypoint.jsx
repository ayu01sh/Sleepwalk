import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Waypoint({ planet }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle pulsing and rotation
      const t = clock.elapsedTime;
      meshRef.current.position.y = (planet.radius + 3) + Math.sin(t * 2) * 0.5;
      meshRef.current.rotation.y = t;
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, planet.radius + 3, 0]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial 
        color="#4fc3f7" 
        wireframe={true} 
        transparent={true} 
        opacity={0.6} 
      />
    </mesh>
  );
}
