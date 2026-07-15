import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useProgress } from '@react-three/drei';

export default function ControlsOverlay() {
  const [visible, setVisible] = useState(true);
  const { active, progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly interpolate progress to avoid instant jumps and occupy the loading time
  useEffect(() => {
    let animationFrame;
    const target = progress;
    
    const updateProgress = () => {
      setDisplayProgress(prev => {
        // If we are basically there, snap to target
        if (Math.abs(target - prev) < 0.1) return target;
        
        // Move towards target (takes roughly 500-900ms to cover large gaps)
        const step = (target - prev) * 0.05;
        // Enforce a minimum speed so it doesn't stall
        const minStep = target > prev ? 0.3 : -0.3;
        
        return target > prev ? Math.max(prev + step, prev + minStep) : Math.min(prev + step, prev + minStep);
      });
      animationFrame = requestAnimationFrame(updateProgress);
    };
    
    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [progress]);

  useEffect(() => {
    if (!visible) return;
    
    const handleInput = () => {
      // Only allow hiding if loading is fully complete
      if (!active && displayProgress >= 99.9) {
        setVisible(false);
      }
    };
    
    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput);
    window.addEventListener('mousedown', handleInput);
    
    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      window.removeEventListener('mousedown', handleInput);
    };
  }, [visible, active, displayProgress]);

  // Reliable mobile check (excludes touch-screen laptops)
  const isMobilePhone = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 5, 20, 0.85)',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: '12px',
      padding: isMobilePhone ? '30px 20px' : '30px 50px',
      width: isMobilePhone ? '85%' : 'auto',
      maxWidth: '500px',
      color: '#fff',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      zIndex: 1000,
      boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <img src="/favicon.svg" alt="Astronaut Helmet" style={{ width: isMobilePhone ? '32px' : '48px', marginBottom: '10px' }} />
      <h2 style={{ margin: '0 0 15px 0', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '3px', fontSize: isMobilePhone ? '18px' : '24px' }}>
        Built on Earth
      </h2>
      
      <div style={{ marginBottom: isMobilePhone ? '10px' : '25px', fontSize: '14px', color: '#00e5ff' }}>
        LOADING ASSETS... {Math.round(displayProgress)}%
        <div style={{ width: '100%', height: '4px', background: 'rgba(0, 229, 255, 0.2)', marginTop: '8px', borderRadius: '2px' }}>
          <div style={{ width: `${displayProgress}%`, height: '100%', background: '#00e5ff', borderRadius: '2px', transition: 'width 0.1s linear' }} />
        </div>
      </div>
      
      {!isMobilePhone && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '15px 40px', textAlign: 'left', fontSize: '16px', alignItems: 'center' }}>
          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>[W A S D] / Arrows</div>
          <div>Thrusters / Navigate</div>
          
          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Mouse Movement</div>
          <div>Pitch & Yaw (Look Around)</div>
          
          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Hold [SHIFT]</div>
          <div>Engage Warp Speed</div>
          
          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>[SPACEBAR]</div>
          <div>Ascend (Up)</div>

          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>[CTRL]</div>
          <div>Descend (Down)</div>

          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Hold [C]</div>
          <div>View Constellations</div>

          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Press [V]</div>
          <div>Visor Mode (1st Person)</div>

          <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Mouse Scroll</div>
          <div>Adjust Camera Zoom</div>
        </div>
      )}
      
      {(!active && displayProgress >= 99.9) ? (
        <p style={{ marginTop: '30px', fontSize: '14px', color: '#00e5ff', letterSpacing: '2px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
          {isMobilePhone ? 'TAP TO START' : 'PRESS ANY KEY TO START'}
        </p>
      ) : (
        <p style={{ marginTop: '30px', fontSize: '13px', color: '#888', letterSpacing: '1px' }}>
          {isMobilePhone ? 'INITIALIZING SYSTEMS...' : 'INITIALIZING FLIGHT SYSTEMS...'}
        </p>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
