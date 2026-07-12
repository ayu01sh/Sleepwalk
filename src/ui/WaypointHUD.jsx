import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function WaypointHUD({ astronautRef, cameraRef }) {
  const targetWaypoint = useStore(state => state.targetWaypoint);
  const inNebulaZone = useStore(state => state.inNebulaZone);
  
  const [screenPos, setScreenPos] = useState({ x: -1000, y: -1000 });
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [distance, setDistance] = useState(0);
  
  const wpPosVec = useRef(new THREE.Vector3());
  const astroPosVec = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!inNebulaZone || !targetWaypoint) return;

    let animFrameId;
    
    const update = () => {
      if (!astronautRef.current) {
        animFrameId = requestAnimationFrame(update);
        return;
      }

      astronautRef.current.getWorldPosition(astroPosVec.current);
      wpPosVec.current.set(...targetWaypoint.position);
      
      const dist = astroPosVec.current.distanceTo(wpPosVec.current);
      setDistance(dist);

      // We need the camera from the canvas — get it from the astronaut's parent scene
      const scene = astronautRef.current.parent;
      if (!scene) {
        animFrameId = requestAnimationFrame(update);
        return;
      }

      // Walk up to find the camera
      let camera = null;
      scene.traverse((obj) => {
        if (obj.isCamera && obj.type === 'PerspectiveCamera') camera = obj;
      });
      
      if (!camera) {
        animFrameId = requestAnimationFrame(update);
        return;
      }

      const projected = wpPosVec.current.clone().project(camera);
      
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-(projected.y * 0.5) + 0.5) * h;

      const padding = 60;
      let offscreen = false;

      if (projected.z > 1 || x < padding || x > w - padding || y < padding || y > h - padding) {
        offscreen = true;
      }

      setIsOffscreen(offscreen);

      let clampedX = x;
      let clampedY = y;

      if (offscreen) {
        if (projected.z > 1) {
          clampedX = w - x;
          clampedY = h - y;
        }
        
        const cx = w / 2;
        const cy = h / 2;
        const dx = clampedX - cx;
        const dy = clampedY - cy;
        
        const angle = Math.atan2(dy, dx);
        const rectHalfWidth = (w / 2) - padding;
        const rectHalfHeight = (h / 2) - padding;

        let edgeX = cx + (dx > 0 ? rectHalfWidth : -rectHalfWidth);
        let edgeY = cy + (dx > 0 ? rectHalfWidth * Math.tan(angle) : -rectHalfWidth * Math.tan(angle));

        if (edgeY > cy + rectHalfHeight || edgeY < cy - rectHalfHeight) {
          edgeY = cy + (dy > 0 ? rectHalfHeight : -rectHalfHeight);
          edgeX = cx + (dy > 0 ? rectHalfHeight / Math.tan(angle) : -rectHalfHeight / Math.tan(angle));
        }

        clampedX = edgeX;
        clampedY = edgeY;
      }

      setScreenPos({ x: clampedX, y: clampedY });
      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, [inNebulaZone, targetWaypoint, astronautRef]);

  if (!inNebulaZone || !targetWaypoint) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 80,
    }}>
      <div
        style={{
          position: 'absolute',
          left: `${screenPos.x}px`,
          top: `${screenPos.y}px`,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: `2px solid ${isOffscreen ? 'rgba(255, 100, 100, 0.8)' : 'var(--color-accent)'}`,
            transform: 'rotate(45deg)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: `0 0 15px ${isOffscreen ? 'rgba(255, 100, 100, 0.5)' : 'rgba(79, 195, 247, 0.5)'}`,
            transition: 'border-color 0.3s, box-shadow 0.3s'
          }}
        >
          {isOffscreen && (
            <div style={{
              width: '8px',
              height: '8px',
              background: 'rgba(255, 100, 100, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(255, 100, 100, 0.8)'
            }} />
          )}
        </div>
        <div
          style={{
            marginTop: '10px',
            color: isOffscreen ? 'rgba(255, 100, 100, 0.9)' : 'var(--color-accent)',
            fontFamily: 'var(--font-primary)',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${isOffscreen ? 'rgba(255, 100, 100, 0.3)' : 'rgba(79, 195, 247, 0.3)'}`
          }}
        >
          {targetWaypoint.label} — {Math.round(distance)}u
        </div>
        <div style={{
          marginTop: '6px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '10px',
          fontFamily: 'var(--font-primary)'
        }}>
          [N] NEXT
        </div>
      </div>
    </div>
  );
}
