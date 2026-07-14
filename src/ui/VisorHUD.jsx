import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export default function VisorHUD() {
  const isFirstPerson = useStore((state) => state.isFirstPerson);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isFirstPerson) {
      setOpacity(1);
    } else {
      setOpacity(0);
    }
  }, [isFirstPerson]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 45, // Below mobile controls (50) but above everything else
        opacity: opacity,
        transition: 'opacity 0.3s ease-in-out',
        // Visor curve mask
        background: 'radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.8) 100%)',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)',
      }}
    >
      {/* HUD Elements */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(79, 195, 247, 0.6)',
        fontFamily: 'monospace',
        fontSize: '12px',
        textAlign: 'center',
        textShadow: '0 0 5px rgba(79, 195, 247, 0.5)'
      }}>
        EVA SUIT LIFE SUPPORT ONLINE<br/>
        O2: 98% | PRESSURE: NOMINAL
      </div>
      
      {/* Subtle scanlines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.05) 2px, rgba(0, 0, 0, 0.05) 4px)'
      }} />
    </div>
  );
}
