import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NEBULA_CENTER, NEBULA_RADIUS } from '../data/nebulaData';
import { useStore } from '../store/useStore';

// Inline shaders for Points-based particles
const vertexShader = `
  attribute float instanceScale;
  attribute vec3 instanceColor;
  attribute float instanceAlpha;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  uniform float time;
  
  void main() {
    vColor = instanceColor;
    vAlpha = instanceAlpha;
    
    // Animate position with slow drift
    vec3 pos = position;
    pos.x += sin(time * 0.2 + position.z * 0.05) * 3.0;
    pos.y += cos(time * 0.15 + position.x * 0.05) * 3.0;
    pos.z += sin(time * 0.25 + position.y * 0.05) * 3.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Scale point size by distance, clamp to prevent huge particles at close range
    float size = instanceScale * (200.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 0.5, 80.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Soft circular particle
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    float strength = smoothstep(0.5, 0.1, dist);
    
    float finalAlpha = vAlpha * strength;
    if (finalAlpha < 0.01) discard;
    
    gl_FragColor = vec4(vColor, finalAlpha);
  }
`;

export default function NebulaCloud() {
  const pointsRef = useRef();
  const materialRef = useRef();
  
  const quality = useStore(state => state.quality);
  const particleCount = quality === 'high' ? 24000 : 8000;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    // Expanded vibrant color palette for a hyper-colorful nebula
    const colorPalette = [
      new THREE.Color('#6a1b9a'), // Deep Purple
      new THREE.Color('#d81b60'), // Vibrant Magenta
      new THREE.Color('#00e5ff'), // Neon Cyan
      new THREE.Color('#ff3366'), // Hot Pink
      new THREE.Color('#ffcc00'), // Bright Yellow/Gold
      new THREE.Color('#39ff14'), // Neon Green
      new THREE.Color('#7c4dff'), // Electric Violet
      new THREE.Color('#1e88e5'), // Bright Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = NEBULA_RADIUS * Math.cbrt(Math.random());

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.4;
      const z = r * Math.cos(phi);

      positions[i * 3] = NEBULA_CENTER[0] + x;
      positions[i * 3 + 1] = NEBULA_CENTER[1] + y;
      positions[i * 3 + 2] = NEBULA_CENTER[2] + z;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = 15 + Math.random() * 35;
      alphas[i] = 0.15 + Math.random() * 0.25;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('instanceColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('instanceScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('instanceAlpha', new THREE.BufferAttribute(alphas, 1));

    return geo;
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          time: { value: 0 }
        }}
      />
    </points>
  );
}
