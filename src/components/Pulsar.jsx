import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import InfoPanel from './InfoPanel';
import Waypoint from './Waypoint';

const coreVert = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coreFrag = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main() {
  // Swirling, rapidly changing plasma
  float n = noise(vPosition * 15.0 + time * 10.0);
  
  // Intense cyan to pure white core
  vec3 color = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 1.0, 1.0), n);
  
  // Moderate intensity so it doesn't over-bloom into a giant egg
  gl_FragColor = vec4(color * 1.8, 1.0);
}
`;

const beamVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const beamFrag = `
uniform float time;
uniform float pulseRate;
varying vec2 vUv;

void main() {
  // Fade out towards the top of the cone (y=1 is tip, y=0 is base)
  float alpha = smoothstep(1.0, 0.1, vUv.y);
  
  // Soft edges horizontally (vUv.x goes 0 to 1 around the cylinder)
  float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
  
  // Bright cyan/blue
  vec3 color = vec3(0.0, 0.8, 1.0); 
  
  // Combine all with a strong glow factor
  gl_FragColor = vec4(color * 3.0, alpha * edge * 0.8);
}
`;

// Creates a distortion curve for the terrifying crackle
function makeDistortionCurve(amount) {
  let k = typeof amount === 'number' ? amount : 50;
  let n_samples = 44100;
  let curve = new Float32Array(n_samples);
  let deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    let x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export default function Pulsar({ position, astronautRef }) {
  const groupRef = useRef();
  const coreMatRef = useRef();
  const beamMatRef = useRef();
  const beamMatRef2 = useRef();
  
  const audioCtxRef = useRef();
  const synthGainRef = useRef(null);
  
  const PULSE_RATE = 1.5; // Slower so it looks like a sweeping lighthouse beam instead of a blur
  const ROTATION_SPEED = Math.PI * PULSE_RATE * 2.0; // Match physical rotation to pulse

  // Audio setup
  useEffect(() => {
    let ctx = null;
    const initAudio = () => {
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        return;
      }
      
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      synthGainRef.current = masterGain;

      // Drone oscillators
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55; // Low A1

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = 27.5; // Sub A0
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = PULSE_RATE; 

      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0; // modulated by LFO

      // Modulate amplitude
      lfo.connect(pulseGain.gain);

      osc.connect(pulseGain);
      sub.connect(pulseGain);

      // Distortion to create "radiation crackle"
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(100);
      distortion.oversample = '4x';
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Keep it deep and rumbling

      pulseGain.connect(distortion);
      distortion.connect(filter);
      filter.connect(masterGain);

      osc.start();
      sub.start();
      lfo.start();

      if (ctx.state === 'suspended') ctx.resume();
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (ctx) ctx.close();
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    
    if (groupRef.current) {
      // Fast rotation
      groupRef.current.rotation.y += ROTATION_SPEED * delta;
      // Slight wobble
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.2;
    }

    if (coreMatRef.current) {
      coreMatRef.current.uniforms.time.value = time;
    }
    if (beamMatRef.current) {
      beamMatRef.current.uniforms.time.value = time;
    }
    if (beamMatRef2.current) {
      beamMatRef2.current.uniforms.time.value = time;
    }

    // Audio distance attenuation
    if (astronautRef.current && synthGainRef.current && audioCtxRef.current) {
      const dist = astronautRef.current.position.distanceTo(new THREE.Vector3(...position));
      const t = audioCtxRef.current.currentTime;
      
      // Hear it from VERY far away (3000 units), gets deafeningly loud up close
      if (dist < 3000) {
        const vol = Math.pow(Math.max(0, (3000 - dist) / 3000), 1.5);
        synthGainRef.current.gain.setTargetAtTime(vol * 1.5, t, 0.1); 
      } else {
        synthGainRef.current.gain.setTargetAtTime(0, t, 0.5);
      }
    }
  });

  const pulsarData = useMemo(() => ({
    id: 'pulsar-01',
    name: 'PSR B1919+21',
    position: position,
    radius: 40,
    facts: {
      description: 'A rapidly rotating neutron star emitting beams of electromagnetic radiation. Approach with extreme caution.',
      distance: '2283 Light Years',
      diameter: '20 km'
    }
  }), [position]);

  return (
    <group position={position} ref={groupRef}>
      {/* Neutron Star Core */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <shaderMaterial 
          ref={coreMatRef}
          vertexShader={coreVert}
          fragmentShader={coreFrag}
          uniforms={{ time: { value: 0 } }}
        />
        <pointLight intensity={8.0} color="#00e5ff" distance={1500} decay={1.5} />
      </mesh>

      {/* Magnetic Axis (Tilted relative to rotation axis) */}
      <group rotation={[0, 0, Math.PI / 12]}>
        {/* Radiation Beam - North Pole */}
        <mesh position={[0, 300, 0]}>
          <cylinderGeometry args={[0, 40, 600, 32, 1, true]} />
          <shaderMaterial 
            ref={beamMatRef}
            vertexShader={beamVert}
            fragmentShader={beamFrag}
            uniforms={{ 
              time: { value: 0 },
              pulseRate: { value: PULSE_RATE } 
            }}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Radiation Beam - South Pole */}
        <mesh position={[0, -300, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0, 40, 600, 32, 1, true]} />
          <shaderMaterial 
            ref={beamMatRef2}
            vertexShader={beamVert}
            fragmentShader={beamFrag}
            uniforms={{ 
              time: { value: 0 },
              pulseRate: { value: PULSE_RATE } 
            }}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <InfoPanel planet={pulsarData} />
      <Waypoint planet={pulsarData} />
    </group>
  );
}
