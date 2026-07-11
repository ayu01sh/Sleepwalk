import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';

export default function InfoPanel({ planet }) {
  const nearestPlanet = useStore((state) => state.nearestPlanet);
  const isVisible = nearestPlanet === planet.id;

  return (
    <Html
      position={[0, planet.radius + 1, 0]}
      center
      distanceFactor={20} // Scales the HTML with distance
      zIndexRange={[100, 0]}
    >
      <div
        style={{
          width: '280px',
          background: 'var(--color-panel-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-primary)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isVisible ? 'auto' : 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 600, color: '#fff' }}>
          {planet.name}
        </h2>
        <div style={{ fontSize: '12px', color: 'var(--color-accent)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Diameter: {planet.facts.diameter} &middot; Dist: {planet.facts.distance}
        </div>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#ccc' }}>
          {planet.facts.description}
        </p>
      </div>
    </Html>
  );
}
