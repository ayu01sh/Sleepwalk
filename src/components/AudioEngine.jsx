import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { BLACK_HOLE_POSITION } from './BlackHole';

export default function AudioEngine({ astronautRef }) {
  const introComplete = useStore(state => state.introComplete);
  const inNebulaZone = useStore(state => state.inNebulaZone);
  const isFirstPerson = useStore(state => state.isFirstPerson);
  const audioCtxRef = useRef(null);
  
  // Audio nodes
  const masterFilterRef = useRef(null);
  const droneGainRef = useRef(null);
  const thrusterFilterRef = useRef(null);
  const thrusterGainRef = useRef(null);
  
  // Black Hole nodes
  const bhDroneGainRef = useRef(null);
  const bhOscRef = useRef(null);
  const bhDistortionRef = useRef(null);

  useEffect(() => {
    // Only start audio after intro is complete (requires user interaction to start audio context)
    if (!introComplete) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Master filter for muffling external sounds in 1st person
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 20000;
    masterFilter.connect(ctx.destination);
    masterFilterRef.current = masterFilter;

    // --- 1. Ambient Drone (Nebula) ---
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0; // start silent
    droneGain.connect(masterFilter);
    droneGainRef.current = droneGain;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // Low A
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 82.41; // Low E

    // LFO for pulsing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // 10 second cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    
    // Connect LFO to gain's gain parameter
    lfo.connect(lfoGain.gain);

    osc1.connect(lfoGain);
    osc2.connect(lfoGain);
    lfoGain.connect(droneGain);

    osc1.start();
    osc2.start();
    lfo.start();

    // --- 2. Thruster Noise (Filtered White Noise) ---
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const thrusterFilter = ctx.createBiquadFilter();
    thrusterFilter.type = 'lowpass';
    thrusterFilter.frequency.value = 100; // Start muffled
    thrusterFilterRef.current = thrusterFilter;

    const thrusterGain = ctx.createGain();
    thrusterGain.gain.value = 0; // Start silent
    thrusterGain.connect(masterFilter);
    thrusterGainRef.current = thrusterGain;

    noiseSource.connect(thrusterFilter);
    thrusterFilter.connect(thrusterGain);
    noiseSource.start();

    // --- 3. Black Hole Drone (Dynamic) ---
    const bhGain = ctx.createGain();
    bhGain.gain.value = 0; // Start silent
    bhGain.connect(masterFilter);
    bhDroneGainRef.current = bhGain;

    const bhDistortion = ctx.createWaveShaper();
    // Create a distortion curve
    const makeDistortionCurve = (amount) => {
      const k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      return curve;
    };
    bhDistortion.curve = makeDistortionCurve(0); // Start with 0 distortion
    bhDistortion.oversample = '4x';
    bhDistortion.connect(bhGain);
    bhDistortionRef.current = bhDistortion;

    const bhOsc = ctx.createOscillator();
    bhOsc.type = 'sawtooth';
    bhOsc.frequency.value = 100; 
    bhOsc.connect(bhDistortion);
    bhOsc.start();
    bhOscRef.current = bhOsc;

    const resumeAudio = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    
    window.addEventListener('click', resumeAudio);
    window.addEventListener('touchstart', resumeAudio, { passive: true });
    window.addEventListener('pointerdown', resumeAudio, { passive: true });

    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
      window.removeEventListener('pointerdown', resumeAudio);
      ctx.close();
    };
  }, [introComplete]);

  // Hook for Nebula Drone fade in/out
  useEffect(() => {
    if (!audioCtxRef.current || !droneGainRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    
    if (inNebulaZone) {
      droneGainRef.current.gain.setTargetAtTime(0.4, t, 2.0); // Slow fade in
    } else {
      droneGainRef.current.gain.setTargetAtTime(0, t, 2.0); // Slow fade out
    }
  }, [inNebulaZone]);

  const movement = useStore(state => state.movement);

  // Hook to trigger thruster sounds based on movement state
  useEffect(() => {
    if (!introComplete || !audioCtxRef.current || !thrusterGainRef.current || !thrusterFilterRef.current) return;
    
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    
    const isWarping = movement.boost;
    const isMoving = movement.forward || movement.backward || movement.left || movement.right || movement.ascend || movement.descend;

    if (isMoving && isWarping) {
      // Full warp sound
      thrusterGainRef.current.gain.setTargetAtTime(0.3, t, 0.1);
      thrusterFilterRef.current.frequency.setTargetAtTime(1200 * useStore.getState().timeScale, t, 0.2);
    } else if (isMoving) {
      // Standard maneuvering thrusters
      thrusterGainRef.current.gain.setTargetAtTime(0.05, t, 0.1);
      thrusterFilterRef.current.frequency.setTargetAtTime(400 * useStore.getState().timeScale, t, 0.2);
    } else {
      // Idle/silent
      thrusterGainRef.current.gain.setTargetAtTime(0, t, 0.3);
      thrusterFilterRef.current.frequency.setTargetAtTime(100, t, 0.3);
    }
  }, [introComplete, movement]);

  // Hook for Black Hole dynamic proximity audio
  useEffect(() => {
    if (!introComplete || !audioCtxRef.current) return;

    const bhPos = new THREE.Vector3(...BLACK_HOLE_POSITION);
    let animationFrameId;

    const updateBlackHoleAudio = () => {
      if (astronautRef?.current && bhDroneGainRef.current && bhOscRef.current && bhDistortionRef.current) {
        const dist = astronautRef.current.position.distanceTo(bhPos);
        const maxDist = 2000;
        
        if (dist < maxDist) {
          // Closer = more volume, lower pitch, more distortion
          const normalizedDist = dist / maxDist; // 0 (at BH) to 1 (far away)
          const intensity = 1.0 - normalizedDist; // 1 (at BH) to 0 (far away)
          
          // Smoothly ramp audio params to prevent clipping/clicking
          const t = audioCtxRef.current.currentTime;
          
          // Volume: exponential curve for dramatic effect
          const targetVol = Math.pow(intensity, 2) * 0.8; 
          bhDroneGainRef.current.gain.setTargetAtTime(targetVol, t, 0.1);
          
          // Pitch: drops lower as you get closer
          const targetFreq = 100 - (intensity * 60); // Drops from 100Hz to 40Hz
          bhOscRef.current.frequency.setTargetAtTime(targetFreq, t, 0.1);
          
        } else {
          bhDroneGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        }
      }
      animationFrameId = requestAnimationFrame(updateBlackHoleAudio);
    };

    updateBlackHoleAudio();

    return () => cancelAnimationFrame(animationFrameId);
  }, [introComplete, astronautRef]);

  // Hook for First Person Audio (Muffling)
  useEffect(() => {
    if (!audioCtxRef.current || !masterFilterRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    
    if (isFirstPerson) {
      // Muffle external sounds
      masterFilterRef.current.frequency.setTargetAtTime(800, t, 0.5);
    } else {
      // Open filter
      masterFilterRef.current.frequency.setTargetAtTime(20000, t, 0.5);
    }
  }, [isFirstPerson]);

  return null;
}
