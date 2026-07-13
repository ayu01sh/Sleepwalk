import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const COMET_COUNT = 3;
const TAIL_LENGTH = 400; // Increased from 100
const COMET_LIFETIME = 150; // Increased since they are further away

function randomOnSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const tailVertexShader = `
  attribute float instanceAlpha;
  attribute float instanceSize;
  varying float vAlpha;
  void main() {
    vAlpha = instanceAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = instanceSize * (200.0 / -mvPosition.z);
    
    // Clamp point size to avoid massive particles when very close
    gl_PointSize = clamp(gl_PointSize, 1.0, 150.0);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const tailFragmentShader = `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    float glow = smoothstep(0.5, 0.0, d);
    if (glow * vAlpha < 0.01) discard;
    gl_FragColor = vec4(0.6, 0.85, 1.0, glow * vAlpha);
  }
`;

function Comet({ offset }) {
  const headRef = useRef();
  const tailRef = useRef();
  
  // State for this comet
  const state = useMemo(() => ({
    t: offset,
    path: null,
    history: Array.from({ length: TAIL_LENGTH }, () => new THREE.Vector3()),
    headIndex: 0
  }), [offset]);

  // Initialize geometries
  const { headGeo, tailGeo, tailAlphas, tailSizes } = useMemo(() => {
    const tailG = new THREE.BufferGeometry();
    const positions = new Float32Array(TAIL_LENGTH * 3);
    const alphas = new Float32Array(TAIL_LENGTH);
    const sizes = new Float32Array(TAIL_LENGTH);
    
    for (let i = 0; i < TAIL_LENGTH; i++) {
      alphas[i] = 0;
      sizes[i] = 0;
    }
    
    tailG.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tailG.setAttribute('instanceAlpha', new THREE.BufferAttribute(alphas, 1));
    tailG.setAttribute('instanceSize', new THREE.BufferAttribute(sizes, 1));
    
    return {
      headGeo: new THREE.SphereGeometry(0.8, 16, 16), // Smaller head
      tailGeo: tailG,
      tailAlphas: alphas,
      tailSizes: sizes
    };
  }, []);

  useFrame((_, delta) => {
    if (!state.path) {
      // Generate new path further away
      const start = randomOnSphere(6000);
      const end = randomOnSphere(6000);
      
      // Control point bulges outward to create an arc
      const control = new THREE.Vector3().lerpVectors(start, end, 0.5);
      const bulge = control.clone().normalize().multiplyScalar(2000); 
      control.add(bulge);
      
      state.path = new THREE.QuadraticBezierCurve3(start, control, end);
      state.history.forEach(v => v.copy(start)); // Reset tail to start pos
    }

    state.t += delta / COMET_LIFETIME;
    
    if (state.t >= 1) {
      state.t = 0;
      state.path = null;
      return;
    }

    const pos = state.path.getPoint(state.t);
    if (headRef.current) {
      headRef.current.position.copy(pos);
    }

    // Update history ring buffer
    state.headIndex = (state.headIndex + 1) % TAIL_LENGTH;
    state.history[state.headIndex].copy(pos);
    
    // Update tail geometry
    if (tailRef.current) {
      const positions = tailGeo.attributes.position.array;
      
      for (let i = 0; i < TAIL_LENGTH; i++) {
        // age goes from 0 (newest) to 1 (oldest)
        const age = i / TAIL_LENGTH;
        // The index in the history array, going backwards from head
        const histIdx = (state.headIndex - i + TAIL_LENGTH) % TAIL_LENGTH;
        const p = state.history[histIdx];
        
        const posIdx = i * 3;
        positions[posIdx] = p.x;
        positions[posIdx + 1] = p.y;
        positions[posIdx + 2] = p.z;
        
        // Fade in at start and out at end of comet's life
        let lifeAlpha = 1.0;
        if (state.t < 0.05) lifeAlpha = state.t / 0.05;
        if (state.t > 0.95) lifeAlpha = (1 - state.t) / 0.05;
        
        tailAlphas[i] = Math.max(0, (1 - Math.pow(age, 0.5)) * 0.6 * lifeAlpha); // Reduced max alpha from 0.8 to 0.6
        tailSizes[i] = Math.max(1, (1 - Math.pow(age, 0.3)) * 80); // Reduced size multiplier from 120 to 80 and adjusted falloff curve
      }
      
      tailGeo.attributes.position.needsUpdate = true;
      tailGeo.attributes.instanceAlpha.needsUpdate = true;
      tailGeo.attributes.instanceSize.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={headRef} geometry={headGeo}>
        <meshStandardMaterial 
          color="#aaddff" 
          emissive="#66ccff" 
          emissiveIntensity={1.5} // Reduced from 3.0
          toneMapped={false}
        />
      </mesh>
      <points ref={tailRef} geometry={tailGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={tailVertexShader}
          fragmentShader={tailFragmentShader}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function Comets() {
  const quality = useStore(state => state.quality);
  
  if (quality === 'low') return null;

  return (
    <group>
      {Array.from({ length: COMET_COUNT }).map((_, i) => (
        <Comet key={i} offset={i / COMET_COUNT} />
      ))}
    </group>
  );
}
