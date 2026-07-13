import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const MAX_STREAKS = 7;
const SPAWN_DISTANCE = 4900;
const TRAVEL_DISTANCE = 2100;

function getRandomDirectionOnSphere() {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.sin(phi) * Math.sin(theta);
  const z = Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
}

export default function ShootingStars({ astronautRef }) {
  const quality = useStore(state => state.quality);
  const linesRef = useRef([]);
  const materialsRef = useRef([]);
  
  // State for the streaks pool
  const streaks = useMemo(() => Array.from({ length: MAX_STREAKS }, () => ({
    active: false,
    progress: 0,
    duration: 0.5,
    origin: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    travelDist: TRAVEL_DISTANCE,
    trailLength: 200
  })), []);
  
  // Timer for spawning
  const spawnTimer = useRef(0);
  const nextSpawnTime = useRef(Math.random() * 1 + 0.5); // First one sooner

  useFrame((state, delta) => {
    if (quality === 'low' || !astronautRef.current) return;

    spawnTimer.current += delta;
    if (spawnTimer.current > nextSpawnTime.current) {
      spawnTimer.current = 0;
      nextSpawnTime.current = Math.random() * 1.5 + 0.5; // next in 0.5-2.0s
      
      // Find an inactive streak
      const streak = streaks.find(s => !s.active);
      if (streak) {
        streak.active = true;
        streak.progress = 0;
        streak.duration = Math.random() * 0.5 + 0.5; // 0.5s to 1.0s (slower)
        streak.travelDist = TRAVEL_DISTANCE + (Math.random() - 0.5) * 500;
        streak.trailLength = 400 + Math.random() * 400; // Much longer trails
        
        const playerPos = astronautRef.current.position;
        const spawnDir = getRandomDirectionOnSphere();
        streak.origin.copy(playerPos).add(spawnDir.multiplyScalar(SPAWN_DISTANCE));
        
        // Random tangent vector for direction across the sky
        const randomVec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        streak.direction.crossVectors(spawnDir, randomVec).normalize();
      }
    }

    // Animate active streaks
    streaks.forEach((streak, i) => {
      if (streak.active) {
        streak.progress += delta / streak.duration;
        
        // Allow time for tail to catch up before deactivating
        if (streak.progress > 1.2) { 
          streak.active = false;
          if (materialsRef.current[i]) {
             materialsRef.current[i].opacity = 0;
          }
          return;
        }

        const headProg = Math.min(1, streak.progress);
        const tailProg = Math.max(0, streak.progress - (streak.trailLength / streak.travelDist));

        const head = streak.origin.clone().addScaledVector(streak.direction, headProg * streak.travelDist);
        const tail = streak.origin.clone().addScaledVector(streak.direction, tailProg * streak.travelDist);

        const line = linesRef.current[i];
        if (line && line.geometry) {
          const positions = line.geometry.attributes.position;
          positions.setXYZ(0, tail.x, tail.y, tail.z);
          positions.setXYZ(1, head.x, head.y, head.z);
          positions.needsUpdate = true;
          
          // Fade out at the very end
          let opacity = 1;
          if (streak.progress > 0.8) {
            opacity = Math.max(0, 1 - ((streak.progress - 0.8) / 0.4));
          }
          // Also fade in at the very beginning
          if (streak.progress < 0.2) {
             opacity = streak.progress / 0.2;
          }
          
          if (materialsRef.current[i]) {
            materialsRef.current[i].opacity = opacity; // Max opacity 1.0 (removed the 0.8 multiplier)
          }
        }
      }
    });
  });

  if (quality === 'low') return null;

  return (
    <group>
      {streaks.map((_, i) => (
        <line key={i} ref={el => linesRef.current[i] = el} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(6)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={el => materialsRef.current[i] = el}
            color="#ffffff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </line>
      ))}
    </group>
  );
}
