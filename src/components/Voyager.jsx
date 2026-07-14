import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Waypoint from './Waypoint';

export default function Voyager({ position, astronautRef }) {
  const groupRef = useRef();
  const [isNear, setIsNear] = useState(false);
  const audioCtxRef = useRef(null);
  const synthGainRef = useRef(null);

  // Audio Synth setup
  useEffect(() => {
    let ctx = null;
    let masterGain = null;

    const initAudio = () => {
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        return;
      }
      
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      masterGain = ctx.createGain();
      masterGain.gain.value = 0; // start silent
      masterGain.connect(ctx.destination);
      synthGainRef.current = masterGain;

      // Create a haunting arpeggio / chord to represent the Golden Record
      // A major 9th chord (A, C#, E, G#, B)
      const freqs = [220, 277.18, 329.63, 415.30, 493.88]; 
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + i * 0.05; // Different speeds
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.8;
        lfo.connect(lfoGain);
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.1; // base volume
        lfoGain.connect(oscGain.gain);
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        lfo.start();
      });

      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (ctx) {
        ctx.close();
      }
    };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Slow rotation drifting in space
      groupRef.current.rotation.y = clock.elapsedTime * 0.1;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.2) * 5;

      // Distance check
      if (astronautRef.current) {
        const dist = astronautRef.current.position.distanceTo(new THREE.Vector3(...position));
        const near = dist < 150;
        
        if (near !== isNear) {
          setIsNear(near);
        }

        // Modulate audio volume based on distance (acts as an audio beacon)
        if (synthGainRef.current && audioCtxRef.current) {
          const t = audioCtxRef.current.currentTime;
          if (dist < 2000) { // Fades in from 2000 units away!
            // Volume increases as you get closer
            const vol = Math.pow(Math.max(0, (2000 - dist) / 2000), 2);
            synthGainRef.current.gain.setTargetAtTime(vol * 0.8, t, 0.1); // Increased max volume to 0.8
          } else {
            synthGainRef.current.gain.setTargetAtTime(0, t, 0.5);
          }
        }
      }
    }
  });

  const voyagerData = {
    id: 'voyager',
    name: 'Voyager 1',
    position: position,
    radius: 10,
  };

  return (
    <group position={position} scale={3} ref={groupRef}>
      {/* Central Bus (Decagon approximate) */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 1, 10]} />
        <meshStandardMaterial color="#cccccc" emissive="#444444" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* High Gain Antenna Dish */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[2.8, 0.5, 1.5, 32]} />
        <meshStandardMaterial color="#eeeeee" emissive="#555555" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* RTG (Power Source) */}
      <mesh position={[2.5, -0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.3, 0.3, 2.5, 16]} />
        <meshStandardMaterial color="#222222" emissive="#ff3300" emissiveIntensity={0.5} metalness={0.6} roughness={0.7} />
      </mesh>

      {/* Magnetometer Boom */}
      <mesh position={[-4, -1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 8, 8]} />
        <meshStandardMaterial color="#aaaaaa" emissive="#333333" metalness={1} roughness={0.2} />
      </mesh>

      {/* The Golden Record */}
      <mesh position={[1.4, 0, 0.8]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={2.0} metalness={1} roughness={0.1} />
        {/* Intense glow for the record */}
        <pointLight intensity={3.0} color="#ffaa00" distance={200} />
      </mesh>

      {/* Soft local illumination */}
      <pointLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" distance={200} />

      {/* Interactive UI Label */}
      {isNear && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(10, 10, 15, 0.85)',
            border: '1px solid #ffd700',
            padding: '12px 20px',
            borderRadius: '6px',
            color: '#ffd700',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', letterSpacing: '2px' }}>VOYAGER 1</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', opacity: 0.9 }}>STATUS: INTERSTELLAR</p>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>TRANSMITTING: THE SOUNDS OF EARTH</p>
          </div>
        </Html>
      )}
      <Waypoint planet={voyagerData} />
    </group>
  );
}
