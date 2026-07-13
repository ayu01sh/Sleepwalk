import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const auroraVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const auroraFrag = `
  uniform float time;
  uniform float opacity;
  varying vec2 vUv;

  void main() {
    // vUv.x is around the tube cross-section, vUv.y is around the ring circumference
    float wave = sin(vUv.y * 20.0 + time * 2.0) * 0.5 + 0.5;
    float shimmer = sin(vUv.y * 50.0 - time * 5.0) * 0.3 + 0.7;
    
    vec3 green = vec3(0.0, 1.0, 0.4);
    vec3 purple = vec3(0.5, 0.0, 1.0);
    vec3 color = mix(green, purple, sin(vUv.y * 8.0 + time) * 0.5 + 0.5);
    
    // Fade at the top and bottom of the tube to create a soft curtain
    float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    
    float alpha = wave * shimmer * edgeFade * 0.6;
    
    if (alpha * opacity < 0.01) discard;
    
    gl_FragColor = vec4(color * 1.5, alpha * opacity);
  }
`;

export default function Aurora() {
  const northRef = useRef();
  const southRef = useRef();
  const quality = useStore(state => state.quality);
  const { camera } = useThree();
  const earthPos = useMemo(() => new THREE.Vector3(), []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: auroraVert,
    fragmentShader: auroraFrag,
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  useFrame(({ clock }) => {
    if (quality === 'low') return;
    
    const time = clock.elapsedTime;
    material.uniforms.time.value = time;
    
    let opacity = 0;
    if (northRef.current) {
      northRef.current.getWorldPosition(earthPos);
      const dist = camera.position.distanceTo(earthPos);
      
      // Fade in linearly between 120 and 50 units
      if (dist < 120) {
        opacity = 1.0 - Math.max(0, (dist - 50) / 70);
      }
    }
    
    material.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
    
    // Rotate rings slowly
    if (northRef.current) northRef.current.rotation.z = time * 0.05;
    if (southRef.current) southRef.current.rotation.z = -time * 0.05;
  });

  if (quality === 'low') return null;

  return (
    <group rotation={[0, 0, 23.5 * Math.PI / 180]}>
      {/* North Pole Aurora */}
      <mesh ref={northRef} position={[0, 5.98, 0]} rotation={[Math.PI / 2, 0, 0]} material={material}>
        <torusGeometry args={[2.6, 0.78, 16, 100]} />
      </mesh>
      {/* South Pole Aurora */}
      <mesh ref={southRef} position={[0, -5.98, 0]} rotation={[Math.PI / 2, 0, 0]} material={material}>
        <torusGeometry args={[2.6, 0.78, 16, 100]} />
      </mesh>
    </group>
  );
}
