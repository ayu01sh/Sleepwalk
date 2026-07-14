import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import Waypoint from './Waypoint';

const nebulaVert = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const nebulaFrag = `
uniform float time;
uniform vec3 color;
uniform float density;
varying vec2 vUv;
varying vec3 vPosition;

// Simple 3D noise
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float f = 0.0;
  f += 0.5000 * noise(p); p = p * 2.02;
  f += 0.2500 * noise(p); p = p * 2.03;
  f += 0.1250 * noise(p); p = p * 2.01;
  f += 0.0625 * noise(p);
  return f / 0.9375;
}

void main() {
  vec3 p = vPosition * 0.015 + time * 0.1;
  float n = fbm(p);
  
  // Fade edges smoothly based on UV (Torus u is around tube, v is around ring)
  float edge = sin(vUv.y * 3.14159) * sin(vUv.x * 3.14159);
  
  float alpha = n * edge * density;
  
  // Pre-multiply alpha for Additive Blending
  gl_FragColor = vec4(color * alpha * 2.0, alpha);
}
`;

export default function Supernova({ position }) {
  const groupRef = useRef();
  
  // Materials
  const matInner = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color('#00ffff') }, density: { value: 1.5 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  const matMiddle = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color('#ffaa00') }, density: { value: 1.2 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  const matOuter = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color('#ff0033') }, density: { value: 0.8 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
      groupRef.current.rotation.z = Math.sin(t * 0.02) * 0.2;
      groupRef.current.rotation.x = Math.PI / 4; // Tilt it so it looks like an eye from the origin
    }
    matInner.uniforms.time.value = t;
    matMiddle.uniforms.time.value = t;
    matOuter.uniforms.time.value = t;
  });

  const supernovaData = useMemo(() => ({
    id: 'supernova-01',
    name: 'Cassiopeia A Remnant',
    position: position,
    radius: 900,
    facts: {
      description: 'A beautiful and terrifying expanding cloud of gas and dust. Looks like a giant cosmic eye.',
      distance: '11,000 Light Years',
      diameter: '10 Light Years'
    }
  }), [position]);

  return (
    <group position={position}>
      <group ref={groupRef} scale={[2, 2, 2]}>
        {/* Central White Dwarf */}
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight intensity={5.0} color="#00ffff" distance={1000} decay={2} />
        </mesh>

        {/* Inner Cyan Ring */}
        <mesh material={matInner}>
          <torusGeometry args={[120, 60, 32, 64]} />
        </mesh>

        {/* Middle Yellow Ring */}
        <mesh material={matMiddle}>
          <torusGeometry args={[220, 80, 32, 64]} />
        </mesh>

        {/* Outer Red/Orange Shell */}
        <mesh material={matOuter}>
          <torusGeometry args={[340, 100, 32, 64]} />
        </mesh>
      </group>

      <InfoPanel planet={supernovaData} />
      <Waypoint planet={supernovaData} />
    </group>
  );
}
