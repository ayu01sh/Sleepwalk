import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Decal } from '@react-three/drei';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import Waypoint from './Waypoint';

export default function ISROSpaceship() {
  const groupRef = useRef();
  
  // Load the new separate texture
  const logoMap = useTexture('/textures/isro-logo-05.png');
  logoMap.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      // Slowly rotate the entire spacecraft for a majestic feel
      groupRef.current.rotation.y -= delta * 0.2;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Spacecraft is at Z = 2000 (just beyond Neptune)
  const position = [0, 0, 2000];

  // We'll create a fake planet data object so InfoPanel and Waypoint can render properly
  const shipData = {
    id: 'isro-spaceship',
    name: 'ISRO Probe',
    position: position,
    radius: 15,
    facts: {
      description: 'An Indian Space Research Organisation (ISRO) deep-space probe charting the outer limits of the solar system.',
      distance: 'Deep Space',
      diameter: '30 meters'
    }
  };

  return (
    <group position={position} scale={4}>
      <group ref={groupRef}>
        {/* 1. Main Fuselage (Cylinder) */}
        <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]}>
          <cylinderGeometry args={[5, 5, 20, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#888888"
            emissiveIntensity={1.1}
            metalness={0.2}
            roughness={0.6}
          />
          <Decal position={[5, 0, 0]} rotation={[0, Math.PI / 2, Math.PI]} scale={[8, 8, 2]}>
            <meshStandardMaterial map={logoMap} emissive="#aaaaaa" emissiveIntensity={1.1} emissiveMap={logoMap} transparent polygonOffset polygonOffsetFactor={-1} />
          </Decal>
        </mesh>

        {/* 2. Left Solar Panel */}
        <mesh position={[-15, 0, 0]}>
          <boxGeometry args={[20, 0.5, 8]} />
          <meshStandardMaterial color="#1a237e" emissive="#1a237e" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Panel Support strut */}
        <mesh position={[-7.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 5, 8]} />
          <meshStandardMaterial color="#888888" emissive="#555555" metalness={0.8} />
        </mesh>

        {/* 3. Right Solar Panel */}
        <mesh position={[15, 0, 0]}>
          <boxGeometry args={[20, 0.5, 8]} />
          <meshStandardMaterial color="#1a237e" emissive="#1a237e" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Panel Support strut */}
        <mesh position={[7.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 5, 8]} />
          <meshStandardMaterial color="#888888" emissive="#555555" metalness={0.8} />
        </mesh>

        {/* 4. Thruster Nozzle (Back) */}
        <mesh position={[0, 0, 11]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[3, 5, 16]} />
          <meshStandardMaterial color="#444444" emissive="#333333" metalness={0.9} roughness={0.7} />
        </mesh>
        
        {/* Engine Glow */}
        <pointLight position={[0, 0, 13]} intensity={5.0} distance={100} color="#00e5ff" />
        <mesh position={[0, 0, 12]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.5, 16]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>

        {/* 5. Communication Dish (Front) */}
        <mesh position={[0, 0, -11]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial color="#ffffff" emissive="#888888" emissiveIntensity={1.0} metalness={0.2} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Dish Antenna pin */}
        <mesh position={[0, 0, -13]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
          <meshStandardMaterial color="#ff3333" emissive="#ff3333" />
        </mesh>
      </group>

      <InfoPanel planet={shipData} />
      <Waypoint planet={shipData} />
    </group>
  );
}
