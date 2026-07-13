import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

// Mulberry32 seeded PRNG for consistent asteroid placement
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export default function AsteroidBelt() {
  const meshRef = useRef();
  const quality = useStore(state => state.quality);
  
  const count = quality === 'high' ? 300 : 120;
  const beltCenter = new THREE.Vector3(160, 0, 65); // Midpoint between Mars and Jupiter
  const beltRadius = 50;
  const beltThickness = 15;
  
  // Pre-allocate dummy object for computing instance matrices in the render loop
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store initial transformations and rotation speeds
  const asteroids = useMemo(() => {
    const seededRandom = mulberry32(12345);
    const data = [];
    for (let i = 0; i < 300; i++) { // Always generate max count
      const angle = seededRandom() * Math.PI * 2;
      const r = beltRadius + (seededRandom() - 0.5) * beltThickness;
      const x = beltCenter.x + Math.cos(angle) * r;
      const z = beltCenter.z + Math.sin(angle) * r;
      const y = (seededRandom() - 0.5) * 5; // slight vertical scatter
      
      data.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(
          seededRandom() * Math.PI,
          seededRandom() * Math.PI,
          seededRandom() * Math.PI
        ),
        scale: 0.3 + seededRandom() * 0.9, // 0.3 to 1.2
        rotSpeed: new THREE.Vector3(
          (seededRandom() - 0.5) * 0.5,
          (seededRandom() - 0.5) * 0.5,
          (seededRandom() - 0.5) * 0.5
        )
      });
    }
    return data;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Animate rotation of each instance
    for (let i = 0; i < count; i++) {
      const asteroid = asteroids[i];
      // Slowly spin the asteroid
      asteroid.rotation.x += asteroid.rotSpeed.x * delta;
      asteroid.rotation.y += asteroid.rotSpeed.y * delta;
      asteroid.rotation.z += asteroid.rotSpeed.z * delta;
      
      // Update dummy matrix
      dummy.position.copy(asteroid.position);
      dummy.rotation.copy(asteroid.rotation);
      dummy.scale.setScalar(asteroid.scale);
      dummy.updateMatrix();
      
      // Apply to instanced mesh
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      {/* icosahedron detail level 0 = 20 faces, very cheap */}
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#888888" 
        roughness={0.9} 
        metalness={0.2}
      />
    </instancedMesh>
  );
}
