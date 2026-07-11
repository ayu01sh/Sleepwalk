import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const sunVert = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sunFrag = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

// Simple 3D noise function
float hash(vec3 p) {
    p  = fract( p*0.3183099+.1 );
    p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}

float noise( in vec3 x ) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                   mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                   mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}

// Fractal Brownian Motion
float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100);
    for (int i = 0; i < 5; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    // Generate animated noise on the surface
    vec3 p = vPosition * 0.1;
    float q = fbm(p - time * 0.1);
    
    // Core colors: deep red/orange to bright yellow/white
    vec3 col1 = vec3(1.0, 0.2, 0.0); // Reddish orange
    vec3 col2 = vec3(1.0, 0.8, 0.1); // Bright yellow
    vec3 col3 = vec3(1.0, 1.0, 0.8); // Hot white
    
    // Mix colors based on noise
    vec3 finalColor = mix(col1, col2, q);
    finalColor = mix(finalColor, col3, smoothstep(0.6, 1.0, q));
    
    // Boost intensity significantly so Bloom picks it up
    gl_FragColor = vec4(finalColor * 2.0, 1.0);
}
`;

export default function Sun() {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[25, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVert}
          fragmentShader={sunFrag}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </mesh>
      
      {/* Light emitted from the sun */}
      <pointLight 
        intensity={3.0} 
        distance={2000} 
        decay={0} 
        color="#fff5e6" 
      />
    </group>
  );
}
