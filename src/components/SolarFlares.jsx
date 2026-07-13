import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const FLARE_LIFETIME = 18; // even slower
const SUN_RADIUS = 45; // Pushed out past the massive bloom corona

const flareVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flareFrag = `
  varying vec2 vUv;
  uniform float opacity;
  
  void main() {
    // UV x is along the tube, y is around the tube
    float along = vUv.x;
    
    // Color gradient from base to tip
    vec3 baseColor = vec3(1.0, 1.0, 0.8); // White/yellow
    vec3 midColor = vec3(1.0, 0.4, 0.0);  // Orange
    vec3 tipColor = vec3(0.8, 0.0, 0.0);  // Deep red
    
    vec3 color = mix(baseColor, midColor, smoothstep(0.0, 0.4, along));
    color = mix(color, tipColor, smoothstep(0.4, 1.0, along));
    
    // Fade out at the tip
    float alpha = smoothstep(1.0, 0.7, along);
    
    // Soften the base so it blends into the sun
    alpha *= smoothstep(0.0, 0.1, along);
    
    // Soften the edges of the tube
    float edge = sin(vUv.y * 3.14159);
    alpha *= pow(edge, 1.5);
    
    if (alpha * opacity < 0.01) discard;
    
    // Multiply color by 6 to force it to pierce the sun's bloom
    gl_FragColor = vec4(color * 6.0, alpha * opacity);
  }
`;

function randomDir() {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  );
}

function Flare({ offset }) {
  const meshRef = useRef();
  const materialRef = useRef();
  
  const state = useMemo(() => {
    const dir = randomDir();
    const basePos = dir.clone().multiplyScalar(SUN_RADIUS - 0.5); // Slightly inside sun
    
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.y) > 0.9) up.set(1, 0, 0);
    const tangent = new THREE.Vector3().crossVectors(dir, up).normalize();
    
    const p0 = basePos.clone();
    const p1 = basePos.clone();
    const p2 = basePos.clone();
    const p3 = basePos.clone();
    const p4 = basePos.clone();
    
    const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3, p4]);
    
    return {
      t: offset * FLARE_LIFETIME,
      basePos,
      dir,
      tangent,
      curve,
      maxExtension: 80 + Math.random() * 60, // Absolutely massive extensions
      points: [p0, p1, p2, p3, p4]
    };
  }, [offset]);
  
  useFrame((_, delta) => {
    state.t += delta;
    if (state.t > FLARE_LIFETIME) {
      state.t -= FLARE_LIFETIME;
      // Re-seed position and direction
      const dir = randomDir();
      state.basePos.copy(dir.clone().multiplyScalar(SUN_RADIUS - 0.5));
      const up = new THREE.Vector3(0, 1, 0);
      if (Math.abs(dir.y) > 0.9) up.set(1, 0, 0);
      state.tangent.crossVectors(dir, up).normalize();
      state.maxExtension = 80 + Math.random() * 60;
    }
    
    const phase = state.t / FLARE_LIFETIME;
    
    let extension = 0;
    let opacity = 0;
    
    if (phase < 0.3) {
      // Erupting
      extension = phase / 0.3;
      opacity = extension;
    } else if (phase < 0.7) {
      // Sustained
      extension = 1.0 + Math.sin(phase * 20) * 0.05; // slight flutter
      opacity = 1.0;
    } else {
      // Collapsing
      const collapsePhase = (phase - 0.7) / 0.3;
      extension = 1.0 - collapsePhase;
      opacity = 1.0 - collapsePhase;
    }
    
    // Update curve control points to form an arc
    const extVec = state.dir.clone().multiplyScalar(extension * state.maxExtension);
    const tangVec = state.tangent.clone();
    
    state.points[0].copy(state.basePos);
    state.points[1].copy(state.basePos).add(extVec.clone().multiplyScalar(0.4)).add(tangVec.clone().multiplyScalar(5));
    state.points[2].copy(state.basePos).add(extVec).add(tangVec.clone().multiplyScalar(10)); // Peak
    state.points[3].copy(state.basePos).add(extVec.clone().multiplyScalar(0.4)).add(tangVec.clone().multiplyScalar(15));
    state.points[4].copy(state.basePos).add(tangVec.clone().multiplyScalar(20));
    
    if (meshRef.current) {
      const oldGeo = meshRef.current.geometry;
      // 24 segments, radius 6.0, 8 radial segments
      meshRef.current.geometry = new THREE.TubeGeometry(state.curve, 24, 6.0, 8, false);
      if (oldGeo) oldGeo.dispose();
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.opacity.value = opacity;
    }
  });

  useEffect(() => {
    return () => {
      if (meshRef.current && meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <tubeGeometry args={[state.curve, 24, 6.0, 8, false]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={flareVert}
        fragmentShader={flareFrag}
        uniforms={{ opacity: { value: 0 } }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function SolarFlares() {
  const quality = useStore(state => state.quality);
  const count = quality === 'high' ? 4 : 2;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <Flare key={i} offset={i / count} />
      ))}
    </group>
  );
}
