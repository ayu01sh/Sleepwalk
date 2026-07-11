import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import Waypoint from './Waypoint';
import { planets } from '../data/planets';

const atmosphereVert = `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFrag = `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  float intensity = pow(0.7 - dot(vNormal, vPositionNormal), 4.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}
`;

export default function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [albedoMap, specularMap, normalMap, cloudsMap, nightMap] = useTexture([
    '/textures/earth/earth_albedo.jpg',
    '/textures/earth/earth_specular.jpg',
    '/textures/earth/earth_normal.jpg',
    '/textures/earth/earth_clouds.png',
    '/textures/earth/earth_night.png',
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.02;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group position={[0, 0, -30]}>
      {/* 1. Surface Sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          map={albedoMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.6}
          emissiveMap={nightMap}
          emissive={new THREE.Color('#ffcc66')}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* 2. Cloud Shell */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[5.03, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* 3. Atmosphere Rim */}
      <mesh>
        <sphereGeometry args={[5.15, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVert}
          fragmentShader={atmosphereFrag}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent={true}
          depthWrite={false}
        />
      </mesh>

      <InfoPanel planet={planets.find(p => p.id === 'earth')} />
      <Waypoint planet={planets.find(p => p.id === 'earth')} />
    </group>
  );
}
