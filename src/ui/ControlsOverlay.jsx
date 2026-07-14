import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useProgress } from '@react-three/drei';

export default function ControlsOverlay() {
  const [visible, setVisible] = useState(true);
  const { active, progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly interpolate the progress value
  useEffect(() => {
    let animationFrameId;
    
    const updateProgress = () => {
      setDisplayProgress(current => {
        // Move 5% of the remaining distance per frame, or at least 0.5%
        const diff = progress - current;
        if (diff > 0.1) {
          return Math.min(progress, current + diff * 0.1 + 0.2);
        }
        return progress;
      });
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  useEffect(() => {
    // When loading finishes (active becomes false) and smooth progress catches up
    if (!active && displayProgress >= 99.9) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1500); // Give them 1.5s to read the controls after loading finishes
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  // Hide on any key press, even if still loading
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = () => {
      setVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

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
      padding: '30px 50px',
      color: '#fff',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      zIndex: 1000,
      boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <h2 style={{ margin: '0 0 15px 0', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '24px' }}>
        Flight Systems
      </h2>
      
      <div style={{ marginBottom: '25px', fontSize: '14px', color: '#00e5ff' }}>
        LOADING ASSETS... {Math.round(displayProgress)}%
        <div style={{ width: '100%', height: '4px', background: 'rgba(0, 229, 255, 0.2)', marginTop: '8px', borderRadius: '2px' }}>
          <div style={{ width: `${displayProgress}%`, height: '100%', background: '#00e5ff', borderRadius: '2px', transition: 'width 0.1s linear' }} />
        </div>
      </div>
      
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
        
        <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>Mouse Scroll</div>
        <div>Adjust Camera Zoom</div>
      </div>
      
      <p style={{ marginTop: '30px', fontSize: '13px', color: '#888', letterSpacing: '1px' }}>
        PRESS ANY KEY TO ACKNOWLEDGE
      </p>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
