import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export default function ControlsHint() {
  const showControlsHint = useStore((state) => state.showControlsHint);
  const setShowControlsHint = useStore((state) => state.setShowControlsHint);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (showControlsHint) {
      // Small delay before fading in
      const showTimeout = setTimeout(() => setOpacity(1), 500);
      
      const hideTimeout = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => setShowControlsHint(false), 1000); // Wait for fade out
      }, 8000);

      const hideOnInput = () => {
        setOpacity(0);
        setTimeout(() => setShowControlsHint(false), 1000);
      };

      window.addEventListener('keydown', hideOnInput, { once: true });
      window.addEventListener('mousedown', hideOnInput, { once: true });

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
        window.removeEventListener('keydown', hideOnInput);
        window.removeEventListener('mousedown', hideOnInput);
      };
    }
  }, [showControlsHint, setShowControlsHint]);

  if (!showControlsHint && opacity === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      background: 'var(--color-panel-bg)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      color: 'var(--color-text)',
      fontFamily: 'var(--font-primary)',
      fontSize: '14px',
      letterSpacing: '1px',
      opacity: opacity,
      transition: 'opacity 1s ease-in-out',
      pointerEvents: 'none',
      zIndex: 10,
      textAlign: 'center'
    }}>
      WASD to move &middot; Mouse to look &middot; Space / Ctrl to ascend / descend
    </div>
  );
}
