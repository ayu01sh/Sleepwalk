import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import { useStore } from '../store/useStore';
import Waypoint from './Waypoint';
import { getOrbitPosition } from '../utils/orbits';
import Moon from './Moon';
import { gameTime } from '../utils/gameTime';

export default function Planet({ data }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  // Load textures (returns an array based on what's available)
  const textureFiles = Object.values(data.textures);
  const loadedTextures = useTexture(textureFiles);
  
  // Map back to named textures based on order
  const texMap = {};
  Object.keys(data.textures).forEach((key, index) => {
    texMap[key] = loadedTextures[index];
    if (texMap[key]) {
      texMap[key].colorSpace = THREE.SRGBColorSpace;
    }
  });

  useFrame(({ clock }, delta) => {
    if (meshRef.current) {
      const timeScale = useStore.getState().timeScale;
      meshRef.current.rotation.y += delta * 0.05 * timeScale; // Slow rotation
    }
    if (groupRef.current) {
      // Calculate dynamic orbital position
      getOrbitPosition(data.position, gameTime.elapsed, groupRef.current.position);
    }
  });

  return (
    <group ref={groupRef} position={data.position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.radius, 64, 64]} />
        <meshStandardMaterial 
          map={texMap.albedo}
          roughness={0.7}
        />
      </mesh>

      {/* Saturn's Rings */}
      {data.hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.ringRadius[0], data.ringRadius[1], 64]} />
          <meshStandardMaterial 
            map={texMap.albedo}
            alphaMap={texMap.ringAlpha}
            transparent={true}
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Moons */}
      {data.moons && data.moons.map((moonData) => (
        <Moon key={moonData.id} data={moonData} />
      ))}

      {/* Interactive UI Panels */}
      <InfoPanel planet={data} />
      <Waypoint planet={data} />
    </group>
  );
}
