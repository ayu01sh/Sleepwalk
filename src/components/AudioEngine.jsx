import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function AudioEngine() {
  const introComplete = useStore(state => state.introComplete);
  const inNebulaZone = useStore(state => state.inNebulaZone);
  const audioCtxRef = useRef(null);
  
  // Audio nodes
  const droneGainRef = useRef(null);
  const thrusterFilterRef = useRef(null);
  const thrusterGainRef = useRef(null);

  useEffect(() => {
    // Only start audio after intro is complete (requires user interaction to start audio context)
    if (!introComplete) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    // --- 1. Ambient Drone (Nebula) ---
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0; // start silent
    droneGain.connect(ctx.destination);
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
    thrusterGain.connect(ctx.destination);
    thrusterGainRef.current = thrusterGain;

    noiseSource.connect(thrusterFilter);
    thrusterFilter.connect(thrusterGain);
    noiseSource.start();

    return () => {
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

  // Hook into keyboard events to trigger thruster sounds
  useEffect(() => {
    if (!introComplete) return;

    let isWarping = false;
    let isMoving = false;

    const handleKeyDown = (e) => {
      if (e.key === 'Shift') isWarping = true;
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) isMoving = true;
      updateThrusters();
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') isWarping = false;
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) isMoving = false;
      updateThrusters();
    };

    const updateThrusters = () => {
      if (!audioCtxRef.current || !thrusterGainRef.current || !thrusterFilterRef.current) return;
      
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;

      if (isMoving && isWarping) {
        // Full warp sound
        thrusterGainRef.current.gain.setTargetAtTime(0.3, t, 0.1);
        thrusterFilterRef.current.frequency.setTargetAtTime(1200, t, 0.2);
      } else if (isMoving) {
        // Standard maneuvering thrusters
        thrusterGainRef.current.gain.setTargetAtTime(0.05, t, 0.1);
        thrusterFilterRef.current.frequency.setTargetAtTime(400, t, 0.2);
      } else {
        // Idle/silent
        thrusterGainRef.current.gain.setTargetAtTime(0, t, 0.3);
        thrusterFilterRef.current.frequency.setTargetAtTime(100, t, 0.3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [introComplete]);

  return null;
}
