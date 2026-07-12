import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export default function Monolith({ data, imageData }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);
  
  const activeMonolith = useStore(state => state.activeMonolith);
  const isVisible = activeMonolith === data.id;

  // Load texture using Image element for better CORS handling
  useEffect(() => {
    if (!imageData?.url) return;
    
    let cancelled = false;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (cancelled) return;
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    };
    
    img.onerror = () => {
      if (cancelled) return;
      console.warn(`Failed to load image for ${data.id}, using fallback texture`);
      // Create a fallback colored texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0a1628');
      grad.addColorStop(0.5, '#1a0a3e');
      grad.addColorStop(1, '#0a2840');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(imageData?.title || 'Deep Space', 256, 240);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#888';
      ctx.fillText('Image unavailable', 256, 280);
      
      const fallbackTex = new THREE.CanvasTexture(canvas);
      fallbackTex.colorSpace = THREE.SRGBColorSpace;
      setTexture(fallbackTex);
    };
    
    img.src = imageData.url;

    return () => {
      cancelled = true;
    };
  }, [imageData?.url]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.elapsedTime;
      // Gentle bobbing around the base position
      groupRef.current.position.y = data.position[1] + Math.sin(t * 0.5 + data.position[0]) * 1.5;
      // Slow rotation
      groupRef.current.rotation.y = data.rotation[1] + t * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation}>
      <mesh ref={meshRef} scale={data.scale}>
        <boxGeometry args={[1, 1, 1]} />
        
        {/* Holographic edge glow */}
        <Edges scale={1.002} threshold={15} color="#00e5ff" />
        
        {/* 6 materials for a box. Front face (index 4) gets the image */}
        <meshStandardMaterial attach="material-0" color="#0a0a0f" metalness={0.9} roughness={0.1} />
        <meshStandardMaterial attach="material-1" color="#0a0a0f" metalness={0.9} roughness={0.1} />
        <meshStandardMaterial attach="material-2" color="#0a0a0f" metalness={0.9} roughness={0.1} />
        <meshStandardMaterial attach="material-3" color="#0a0a0f" metalness={0.9} roughness={0.1} />
        <meshStandardMaterial 
          attach="material-4" 
          map={texture} 
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={isVisible ? 1.2 : 0.4}
          toneMapped={false}
        />
        <meshStandardMaterial 
          attach="material-5" 
          map={texture} 
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={isVisible ? 1.2 : 0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Info Panel */}
      {imageData && (
        <Html
          position={[0, (data.scale[1] / 2) + 2, 0]}
          center
          distanceFactor={30}
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              width: '320px',
              background: 'var(--color-panel-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-primary)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: isVisible ? 'auto' : 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(0, 229, 255, 0.1)',
            }}
          >
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#fff' }}>
              {imageData.title}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--color-accent)', marginBottom: '12px' }}>
              {imageData.date}
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#ccc', maxHeight: '180px', overflowY: 'auto' }}>
              {imageData.explanation}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
