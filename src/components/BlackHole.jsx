import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../shaders/blackHole.vert?raw';
import fragmentShader from '../shaders/blackHole.frag?raw';

export const BLACK_HOLE_POSITION = [6122, 257, 6077];

export default function BlackHole() {
  const materialRef = useRef();
  const meshRef = useRef();

  // Create uniforms once
  const uniforms = useMemo(() => ({
    time: { value: 0 }
  }), []);

  useFrame(({ clock, camera }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // Make the black hole always face the camera perfectly (billboard effect)
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={BLACK_HOLE_POSITION}>
      {/* Massive plane to act as a canvas for our raymarching/lensing shader */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1500, 1500]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          // Additive blending looks great for the glowing accretion disk, 
          // but we need NormalBlending so the black event horizon can block light
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}
