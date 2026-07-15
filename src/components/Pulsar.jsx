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
varying vec3 vPosition;

void main() {
  // Just a very bright intense sphere with slight pulsing
  float pulse = sin(time * 10.0) * 0.1 + 0.9;
  
  // Almost pure white in center, cyan edge
  float dist = length(vPosition) / 1.5; // assuming radius 1.5
  vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.8, 1.0), smoothstep(0.5, 1.0, dist));
  
  gl_FragColor = vec4(color * 4.0 * pulse, 1.0);
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
  // Fade out towards the top of the cylinder (y=1 is tip, y=0 is base)
  float alpha = smoothstep(1.0, 0.05, vUv.y);
  
  // Soft edges horizontally (vUv.x goes 0 to 1 around the cylinder)
  float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
  
  // Vertical streaks
  float streak = sin(vUv.x * 80.0 + time * 30.0) * sin(vUv.x * 33.0 - time * 25.0);
  float streakIntensity = streak * 0.5 + 0.5;
  
  // Bright cyan/blue/white
  vec3 baseColor = vec3(0.0, 0.6, 1.0); 
  vec3 coreColor = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(baseColor, coreColor, streakIntensity * 0.6 + (1.0 - vUv.y) * 0.5);
  
  // Central bright core of the beam
  float centerGlow = smoothstep(0.2, 0.5, vUv.x) * smoothstep(0.8, 0.5, vUv.x);
  
  // Combine all with a strong glow factor
  gl_FragColor = vec4(color * (3.0 + centerGlow * 4.0), alpha * (edge * 0.3 + centerGlow * 0.8) * (streakIntensity * 0.8 + 0.2));
}
`;

const diskVert = `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const diskFrag = `
uniform float time;
varying vec3 vPosition;

void main() {
  // RingGeometry lies on XY plane, dist is from center
  float dist = length(vPosition.xy);
  
  // Normalize dist between inner radius (2) and outer radius (35)
  float normDist = (dist - 2.0) / 33.0; 
  if (normDist < 0.0 || normDist > 1.0) discard;
  
  float angle = atan(vPosition.y, vPosition.x);
  
  // Create spiral bands
  float spiral = sin(angle * 6.0 - normDist * 25.0 + time * 8.0);
  float spiral2 = sin(angle * 13.0 - normDist * 35.0 + time * 14.0);
  
  float noiseVal = (spiral * 0.6 + spiral2 * 0.4);
  
  // Fade at inner and outer edges
  float alpha = smoothstep(1.0, 0.7, normDist) * smoothstep(0.0, 0.1, normDist);
  
  vec3 baseColor = vec3(0.0, 0.3, 0.8);
  vec3 highlight = vec3(0.4, 1.0, 1.0);
  vec3 color = mix(baseColor, highlight, noiseVal * 0.5 + 0.5);
  
  float glow = pow(noiseVal * 0.5 + 0.5, 2.0);
  
  gl_FragColor = vec4(color * (1.5 + glow * 2.0), alpha * (0.3 + glow * 0.7));
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
  const diskMatRef = useRef();
  
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
    window.addEventListener('touchstart', initAudio, { passive: true });
    window.addEventListener('pointerdown', initAudio, { passive: true });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('pointerdown', initAudio);
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
    if (diskMatRef.current) {
      diskMatRef.current.uniforms.time.value = time;
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
      {/* Accretion Disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 35, 64]} />
        <shaderMaterial 
          ref={diskMatRef}
          vertexShader={diskVert}
          fragmentShader={diskFrag}
          uniforms={{ time: { value: 0 } }}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neutron Star Core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <shaderMaterial 
          ref={coreMatRef}
          vertexShader={coreVert}
          fragmentShader={coreFrag}
          uniforms={{ time: { value: 0 } }}
        />
        <pointLight intensity={10.0} color="#00e5ff" distance={1500} decay={1.5} />
      </mesh>

      {/* Magnetic Axis (Tilted relative to rotation axis) */}
      <group rotation={[0, 0, Math.PI / 12]}>
        {/* Radiation Beam - North Pole */}
        <mesh position={[0, 300, 0]}>
          <cylinderGeometry args={[15, 1.5, 600, 32, 1, true]} />
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
          <cylinderGeometry args={[15, 1.5, 600, 32, 1, true]} />
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
