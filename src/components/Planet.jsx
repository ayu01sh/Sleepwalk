import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import Waypoint from './Waypoint';
import { getOrbitPosition } from '../utils/orbits';

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
      meshRef.current.rotation.y += delta * 0.05; // Slow rotation
    }
    if (groupRef.current) {
      // Calculate dynamic orbital position
      getOrbitPosition(data.position, clock.elapsedTime, groupRef.current.position);
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
      {data.hasRings && texMap.ringAlpha && (
        <mesh rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
          <ringGeometry args={[data.ringRadius[0], data.ringRadius[1], 128]} />
          <meshBasicMaterial 
            map={texMap.albedo} // Using albedo map for ring color for now
            alphaMap={texMap.ringAlpha}
            transparent={true}
            side={THREE.DoubleSide}
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      )}

      <InfoPanel planet={data} />
      <Waypoint planet={data} />
    </group>
  );
}
