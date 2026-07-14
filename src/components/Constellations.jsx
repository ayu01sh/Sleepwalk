import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Hardcoded constellation data (simplified coordinates)
const CONSTELLATIONS = [
  {
    name: "ORION",
    color: "#00e5ff",
    textPos: [100, 2400, 3200],
    lines: [
      // Shoulders to Belt
      [-1000, 2000, 3000], [-100, 1000, 3200],
      [500, 2200, 3100], [300, 900, 3200],
      // Belt
      [-100, 1000, 3200], [100, 950, 3200],
      [100, 950, 3200], [300, 900, 3200],
      // Belt to Feet
      [-100, 1000, 3200], [-400, -300, 3400],
      [300, 900, 3200], [700, -200, 3500],
      // Shoulders connect
      [-1000, 2000, 3000], [500, 2200, 3100],
    ]
  },
  {
    name: "URSA MAJOR",
    color: "#ff00e5",
    textPos: [3200, 3200, -1500],
    lines: [
      // Handle
      [2000, 3000, -2000], [2500, 2800, -1800],
      [2500, 2800, -1800], [3000, 2500, -1500],
      // Handle to Bowl
      [3000, 2500, -1500], [3500, 2300, -1200],
      // Bowl
      [3500, 2300, -1200], [4000, 1800, -1000],
      [4000, 1800, -1000], [4500, 2200, -800],
      [4500, 2200, -800], [3800, 2700, -1000],
      [3800, 2700, -1000], [3500, 2300, -1200]
    ]
  },
  {
    name: "CASSIOPEIA",
    color: "#e5ff00",
    textPos: [-3000, 1500, -2000],
    lines: [
      [-3500, 1000, -2500], [-3200, 1800, -2200],
      [-3200, 1800, -2200], [-2800, 1400, -2000],
      [-2800, 1400, -2000], [-2400, 2000, -1800],
      [-2400, 2000, -1800], [-2000, 1200, -1500]
    ]
  },
  {
    name: "SCORPIUS",
    color: "#ff3300",
    textPos: [-2000, -2000, 3000],
    lines: [
      [-1500, -1000, 2500], [-2000, -1500, 2800],
      [-2500, -1000, 2500], [-2000, -1500, 2800],
      [-2000, -1500, 2800], [-2200, -2000, 3000],
      [-2200, -2000, 3000], [-2500, -2800, 3200],
      [-2500, -2800, 3200], [-2000, -3500, 3000],
      [-2000, -3500, 3000], [-1200, -3200, 2800],
      [-1200, -3200, 2800], [-1000, -2500, 2500]
    ]
  },
  {
    name: "CYGNUS",
    color: "#33ff33",
    textPos: [2000, 4000, 2000],
    lines: [
      [1000, 3000, 1000], [2000, 4000, 2000],
      [2000, 4000, 2000], [3000, 5000, 3000],
      [500, 4500, 2500], [1200, 4200, 2200],
      [1200, 4200, 2200], [2000, 4000, 2000],
      [2000, 4000, 2000], [2800, 3800, 1800],
      [2800, 3800, 1800], [3500, 3500, 1500]
    ]
  },
  {
    name: "LEO",
    color: "#ffcc00",
    textPos: [-3000, 3000, -1000],
    lines: [
      [-3500, 2000, -500], [-3200, 2500, -800],
      [-3200, 2500, -800], [-3000, 3200, -1200],
      [-3000, 3200, -1200], [-3500, 3800, -1500],
      [-3500, 3800, -1500], [-4000, 3500, -1200],
      [-3500, 2000, -500], [-2000, 1800, -1500],
      [-2000, 1800, -1500], [-2500, 2800, -2000],
      [-2500, 2800, -2000], [-3200, 2500, -800]
    ]
  },
  {
    name: "TAURUS",
    color: "#ff6699",
    textPos: [2000, -1000, 3000],
    lines: [
      [1500, -500, 2500], [2000, -1000, 3000],
      [2000, -1000, 3000], [2500, -500, 3200],
      [1500, -500, 2500], [1000, 500, 2000],
      [2500, -500, 3200], [3000, 800, 3500]
    ]
  },
  {
    name: "PEGASUS",
    color: "#99ccff",
    textPos: [3000, -2000, -3000],
    lines: [
      [2000, -1500, -2500], [3500, -1000, -3000],
      [3500, -1000, -3000], [4000, -2500, -3500],
      [4000, -2500, -3500], [2500, -3000, -3000],
      [2500, -3000, -3000], [2000, -1500, -2500],
      [4000, -2500, -3500], [4800, -2000, -4000],
      [2000, -1500, -2500], [1000, -500, -1500]
    ]
  }
];

export default function Constellations() {
  const showConstellations = useStore(state => state.showConstellations);
  const materialRefs = useRef([]);
  const pointsMatRefs = useRef([]);
  const textRefs = useRef([]);
  const opacityRef = useRef(0);

  // Pre-build geometries
  const geometries = useMemo(() => {
    return CONSTELLATIONS.map(c => {
      const points = c.lines.map(arr => new THREE.Vector3(...arr));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Get unique points for the stars
      const uniquePoints = [];
      const seen = new Set();
      points.forEach(p => {
        const key = `${p.x},${p.y},${p.z}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniquePoints.push(p);
        }
      });
      const pointsGeometry = new THREE.BufferGeometry().setFromPoints(uniquePoints);

      return { geometry, pointsGeometry, color: c.color, name: c.name, textPos: c.textPos };
    });
  }, []);

  useFrame((state, delta) => {
    // Smoothly animate opacity based on state
    const target = showConstellations ? 1.0 : 0.0;
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, target, 5 * delta);

    const isVisible = opacityRef.current > 0.01;

    materialRefs.current.forEach(mat => {
      if (mat) {
        mat.opacity = opacityRef.current;
        mat.transparent = true;
        mat.visible = isVisible;
      }
    });

    pointsMatRefs.current.forEach(mat => {
      if (mat) {
        mat.opacity = opacityRef.current;
        mat.transparent = true;
        mat.visible = isVisible;
      }
    });

    textRefs.current.forEach(text => {
      if (text) {
        text.fillOpacity = opacityRef.current;
        text.visible = isVisible;
      }
    });
  });

  return (
    <group position={[1500, 0, 1500]}>
      {geometries.map((c, i) => (
        <group key={i}>
          <lineSegments geometry={c.geometry}>
            <lineBasicMaterial 
              ref={el => materialRefs.current[i] = el}
              color={c.color} 
              linewidth={2} 
              transparent 
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </lineSegments>

          <points geometry={c.pointsGeometry}>
            <pointsMaterial
              ref={el => pointsMatRefs.current[i] = el}
              size={60}
              color={c.color}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              sizeAttenuation={true}
            />
          </points>
          
          <Text
            ref={el => textRefs.current[i] = el}
            position={c.textPos}
            fontSize={200}
            color={c.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0}
            depthTest={false}
            renderOrder={999} // Always draw on top
          >
            {c.name}
          </Text>
        </group>
      ))}
    </group>
  );
}
