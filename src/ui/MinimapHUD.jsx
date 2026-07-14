import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { planets } from '../data/planets';
import { monoliths } from '../data/nebulaData';
import { BLACK_HOLE_POSITION } from '../components/BlackHole';
import { getOrbitPosition } from '../utils/orbits';

// Coordinate mapping: world XZ → minimap pixels
const MAP_RADIUS = 70; // px
const WORLD_SCALE = 0.02; // 1 world unit = 0.02 minimap pixels

// Planet colors for minimap dots (planets.js doesn't have a color property)
const PLANET_COLORS = {
  mercury: '#a0a0a0',
  venus: '#e8cda0',
  earth: '#4fc3f7',
  mars: '#c75b39',
  jupiter: '#c88b3a',
  saturn: '#e0c882',
  uranus: '#73d8d3',
  neptune: '#5b6ee1',
};

// Pre-allocated vector to avoid GC pressure in render loop
const _forward = new THREE.Vector3();

function worldToMinimap(playerPos, targetPos) {
  const dx = (targetPos.x - playerPos.x) * WORLD_SCALE;
  const dz = (targetPos.z - playerPos.z) * WORLD_SCALE;
  const dist = Math.hypot(dx, dz);
  
  if (dist > MAP_RADIUS) {
    // Clamp to edge
    const angle = Math.atan2(dz, dx);
    return {
      x: Math.cos(angle) * (MAP_RADIUS - 4),
      y: Math.sin(angle) * (MAP_RADIUS - 4),
      clamped: true
    };
  }
  return { x: dx, y: dz, clamped: false };
}

export default function MinimapHUD({ astronautRef }) {
  const canvasRef = useRef(null);
  const targetWaypoint = useStore(state => state.targetWaypoint);
  const inNebulaZone = useStore(state => state.inNebulaZone);

  useEffect(() => {
    let animFrameId;
    let lastTime = 0;
    
    const update = (time) => {
      // Throttle to roughly 20 FPS for performance
      if (time - lastTime < 50) {
        animFrameId = requestAnimationFrame(update);
        return;
      }
      lastTime = time;

      if (!canvasRef.current || !astronautRef.current) {
        animFrameId = requestAnimationFrame(update);
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);
      
      const playerPos = astronautRef.current.position;

      // Draw active waypoint line if exists
      if (targetWaypoint) {
        const wpPos = { x: targetWaypoint.position[0], z: targetWaypoint.position[2] };
        const mapPos = worldToMinimap(playerPos, wpPos);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + mapPos.x, cy + mapPos.y);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Planets
      const tempVec = new THREE.Vector3();
      planets.forEach(p => {
        getOrbitPosition(p.position, time / 1000, tempVec);
        const mapPos = worldToMinimap(playerPos, { x: tempVec.x, z: tempVec.z });
        ctx.beginPath();
        ctx.arc(cx + mapPos.x, cy + mapPos.y, mapPos.clamped ? 2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = mapPos.clamped ? 'rgba(255, 255, 255, 0.4)' : (PLANET_COLORS[p.id] || '#fff');
        ctx.fill();
      });

      // Draw Monoliths (only if nearby or in nebula zone)
      if (inNebulaZone) {
        monoliths.forEach(m => {
          const mapPos = worldToMinimap(playerPos, { x: m.position[0], z: m.position[2] });
          if (!mapPos.clamped) {
            ctx.beginPath();
            ctx.arc(cx + mapPos.x, cy + mapPos.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.fill();
          }
        });
      }

      // Draw Black Hole
      const bhPos = worldToMinimap(playerPos, { x: BLACK_HOLE_POSITION[0], z: BLACK_HOLE_POSITION[2] });
      ctx.beginPath();
      ctx.arc(cx + bhPos.x, cy + bhPos.y, bhPos.clamped ? 3 : 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3333';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 5;
      ctx.fill();

      // Draw Pulsar (X = -3000, Z = -3000)
      const pulsarPos = worldToMinimap(playerPos, { x: -3000, z: -3000 });
      ctx.beginPath();
      ctx.arc(cx + pulsarPos.x, cy + pulsarPos.y, pulsarPos.clamped ? 3 : 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff'; // Cyan
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      
      // Draw ISRO Spaceship (Z = 2000)
      const isroPos = worldToMinimap(playerPos, { x: 0, z: 2000 });
      ctx.beginPath();
      ctx.arc(cx + isroPos.x, cy + isroPos.y, isroPos.clamped ? 2 : 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff9933'; // Saffron orange
      ctx.shadowColor = '#ff9933';
      ctx.shadowBlur = 4;
      ctx.fill();

      // Draw Voyager 1 (X = 1500, Z = -2000)
      const voyagerPos = worldToMinimap(playerPos, { x: 1500, z: -2000 });
      ctx.beginPath();
      ctx.arc(cx + voyagerPos.x, cy + voyagerPos.y, voyagerPos.clamped ? 2 : 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700'; // Gold
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 4;
      ctx.fill();

      ctx.shadowBlur = 0; // reset

      // Draw Player (Center)
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffcc';
      ctx.fill();

      // Draw Player direction indicator
      _forward.set(0, 0, -1).applyQuaternion(astronautRef.current.quaternion);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + _forward.x * 10, cy + _forward.z * 10);
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.stroke();

      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, [targetWaypoint, inNebulaZone, astronautRef]);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      background: 'rgba(10, 16, 25, 0.6)',
      backdropFilter: 'blur(8px)',
      border: '2px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(0, 229, 255, 0.1)',
      zIndex: 90,
      pointerEvents: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '1px',
        background: 'rgba(0, 229, 255, 0.1)'
      }} />
      <div style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: 'rgba(0, 229, 255, 0.1)'
      }} />
      <div style={{
        position: 'absolute',
        width: '70%',
        height: '70%',
        borderRadius: '50%',
        border: '1px solid rgba(0, 229, 255, 0.05)'
      }} />
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
}
