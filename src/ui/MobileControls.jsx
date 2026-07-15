import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';

export default function MobileControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const introComplete = useStore((state) => state.introComplete);
  const setMovement = useStore((state) => state.setMovement);
  const showConstellations = useStore((state) => state.showConstellations);
  
  const joystickBaseRef = useRef(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const activeTouchId = useRef(null);

  // Detect if actually a mobile device, not just a touch-capable desktop monitor
  useEffect(() => {
    const checkMobile = () => {
      const isMobilePhone = typeof window !== 'undefined' && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsTouchDevice(isMobilePhone);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isTouchDevice || !introComplete) return null;

  const handleJoystickStart = (e) => {
    e.preventDefault();
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    updateJoystick(touch);
  };

  const handleJoystickMove = (e) => {
    e.preventDefault();
    if (activeTouchId.current === null) return;
    
    // Find the touch we are tracking
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        updateJoystick(e.changedTouches[i]);
        break;
      }
    }
  };

  const handleJoystickEnd = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setJoystickPos({ x: 0, y: 0 });
        
        // Reset movement
        setMovement('forward', false);
        setMovement('backward', false);
        setMovement('left', false);
        setMovement('right', false);
        break;
      }
    }
  };

  const updateJoystick = (touch) => {
    if (!joystickBaseRef.current) return;
    
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    
    const maxDist = rect.width / 2;
    const distance = Math.hypot(dx, dy);
    
    // Clamp to circle
    if (distance > maxDist) {
      dx = (dx / distance) * maxDist;
      dy = (dy / distance) * maxDist;
    }
    
    setJoystickPos({ x: dx, y: dy });
    
    // Threshold to trigger movement (e.g. 20% from center)
    const threshold = maxDist * 0.2;
    
    setMovement('right', dx > threshold);
    setMovement('left', dx < -threshold);
    setMovement('backward', dy > threshold); // Pulling back on joystick moves backward
    setMovement('forward', dy < -threshold); // Pushing forward on joystick moves forward
  };

  const handleButton = (action, isPressed) => (e) => {
    e.preventDefault();
    setMovement(action, isPressed);
  };

  return (
    <div className="mobile-controls-overlay">
      {/* Left side: Joystick */}
      <div className="joystick-zone">
        <div 
          ref={joystickBaseRef}
          className="joystick-base"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          <div 
            className="joystick-knob" 
            style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
          />
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="action-buttons-zone">
        <button 
          className="action-btn constellation-btn"
          onTouchStart={(e) => { 
            e.preventDefault(); 
            const store = useStore.getState();
            store.setShowConstellations(!store.showConstellations); 
          }}
          style={{ fontSize: '17px', background: showConstellations ? 'rgba(0, 229, 255, 0.4)' : 'rgba(10, 16, 25, 0.8)' }}
        >
          ⭐
        </button>
        <button 
          className="action-btn warp-btn"
          onTouchStart={handleButton('boost', true)}
          onTouchEnd={handleButton('boost', false)}
          onTouchCancel={handleButton('boost', false)}
        >
          WARP
        </button>
      </div>
    </div>
  );
}
