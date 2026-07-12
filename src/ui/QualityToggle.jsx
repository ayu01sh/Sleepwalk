import { useStore } from '../store/useStore';

export default function QualityToggle() {
  const quality = useStore(state => state.quality);
  const setQuality = useStore(state => state.setQuality);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'var(--font-primary)',
      color: 'rgba(255, 255, 255, 0.8)'
    }}>
      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quality:</span>
      <button
        onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
        style={{
          background: 'none',
          border: 'none',
          color: quality === 'high' ? 'var(--color-accent)' : 'var(--color-tertiary)',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          padding: '0',
        }}
      >
        {quality}
      </button>
    </div>
  );
}
