import { useEffect, useState, useRef } from 'react';
import { planets } from '../data/planets';

const MAP_SIZE = 200; // pixels
const WORLD_SCALE = 1500; // how much world space fits in the map

export default function Minimap({ astronautRef }) {
  const [visible, setVisible] = useState(true);
  const [playerPos, setPlayerPos] = useState({ x: MAP_SIZE / 2, y: MAP_SIZE / 2 });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        setVisible(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const updateMap = () => {
      if (visible && astronautRef.current) {
        // Map 3D position (X/Z) to 2D Minimap (X/Y)
        const pos = astronautRef.current.position;
        
        // Convert from world coordinates to minimap coordinates
        // Assuming Sun is at 0,0,0 and in center of map
        const mapX = (pos.x / WORLD_SCALE) * MAP_SIZE + (MAP_SIZE / 2);
        const mapY = (pos.z / WORLD_SCALE) * MAP_SIZE + (MAP_SIZE / 2);
        
        setPlayerPos({ x: mapX, y: mapY });
      }
      animationFrameId = requestAnimationFrame(updateMap);
    };

    updateMap();
    return () => cancelAnimationFrame(animationFrameId);
  }, [visible, astronautRef]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: `${MAP_SIZE}px`,
      height: `${MAP_SIZE}px`,
      background: 'rgba(10, 10, 30, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {/* Sun */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: '6px', height: '6px',
        background: '#ffcc00',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 8px #ffcc00'
      }} />

      {/* Planets */}
      {planets.map(planet => {
        const px = (planet.position[0] / WORLD_SCALE) * MAP_SIZE + (MAP_SIZE / 2);
        const py = (planet.position[2] / WORLD_SCALE) * MAP_SIZE + (MAP_SIZE / 2);
        
        return (
          <div key={planet.id} style={{
            position: 'absolute',
            left: `${px}px`,
            top: `${py}px`,
            width: '3px', height: '3px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        );
      })}

      {/* Player */}
      <div style={{
        position: 'absolute',
        left: `${playerPos.x}px`,
        top: `${playerPos.y}px`,
        width: '4px', height: '4px',
        background: '#4fc3f7',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 6px #4fc3f7'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '10px',
        fontFamily: 'var(--font-primary)'
      }}>
        [M] Toggle Map
      </div>
    </div>
  );
}
