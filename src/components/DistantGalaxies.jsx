import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Mulberry32 seeded PRNG
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateGalaxyTexture(type = 'spiral', seedVal) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  const cx = 256, cy = 256;
  const random = mulberry32(seedVal);
  
  ctx.globalCompositeOperation = 'lighter';
  
  if (type === 'spiral') {
    // Intense, glowing core
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
    grad.addColorStop(0, 'rgba(255, 240, 210, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 200, 150, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Realistic spiral arms built from thousands of glowing dust particles
    const numArms = 2 + Math.floor(random() * 3); // 2 to 4 arms
    const twist = 4 + random() * 4;
    
    for (let i = 0; i < 8000; i++) {
      const t = Math.pow(random(), 1.5); // Concentrate particles near the core
      const r = t * 240;
      
      const armIdx = Math.floor(random() * numArms);
      const armAngle = (armIdx / numArms) * Math.PI * 2;
      
      // True spiral curve
      let theta = armAngle + r * (twist / 240);
      
      // Scatter dust off the primary arm curve
      const scatter = (1 - t) * 60 * (random() - 0.5);
      theta += scatter / Math.max(10, r); 
      
      const x = cx + Math.cos(theta) * r + (random() - 0.5) * 20;
      const y = cy + Math.sin(theta) * r + (random() - 0.5) * 20;
      
      // Larger particles occasionally simulate bright star clusters/nebulae
      const size = random() > 0.95 ? random() * 5 : random() * 2;
      const alpha = (1 - t) * 0.15 + 0.02;
      
      // Color grading: Warm yellow/red core transitioning to cool blue outer arms
      const rColor = t < 0.5 ? 255 : Math.floor(100 + random() * 100);
      const gColor = Math.floor(180 + random() * 50);
      const bColor = t > 0.5 ? 255 : Math.floor(150 + random() * 100);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rColor}, ${gColor}, ${bColor}, ${alpha})`;
      ctx.fill();
    }
  } else {
    // Elliptical Galaxy: Smooth, massive, featureless glow
    const rBase = 255;
    const gBase = Math.floor(220 + random() * 30);
    const bBase = Math.floor(180 + random() * 70);
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.3 + random() * 0.4); // Squash into an ellipse
    ctx.translate(-cx, -cy);
    
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 240);
    grad.addColorStop(0, `rgba(${rBase}, ${gBase}, ${bBase}, 1.0)`);
    grad.addColorStop(0.1, `rgba(${rBase}, ${gBase}, ${bBase}, 0.5)`);
    grad.addColorStop(0.4, `rgba(${rBase}, ${gBase}, ${bBase}, 0.1)`);
    grad.addColorStop(1, `rgba(${rBase}, ${gBase}, ${bBase}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add subtle starry noise
    for(let i = 0; i < 4000; i++) {
        const angle = random() * Math.PI * 2;
        const r = Math.pow(random(), 2) * 240;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.fill();
    }
    
    ctx.restore();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

function Galaxy({ data, camera }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
      // rotate on Z axis so they aren't all perfectly horizontal relative to camera
      meshRef.current.rotateZ(data.zRot);
    }
  });

  return (
    <mesh ref={meshRef} position={data.position} frustumCulled={false}>
      <planeGeometry args={[data.size, data.size]} />
      <meshBasicMaterial 
        map={data.texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.3 + data.opacityBonus}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function DistantGalaxies() {
  const { camera } = useThree();
  
  const galaxiesData = useMemo(() => {
    const random = mulberry32(8888);
    const data = [];
    const count = 21;
    
    for (let i = 0; i < count; i++) {
      const isSpiral = random() > 0.5;
      const texture = generateGalaxyTexture(isSpiral ? 'spiral' : 'elliptical', Math.floor(random() * 10000));
      
      const radius = 8000;
      let x, y, z;
      
      // Scatter on a sphere, keeping them out of the main planetary plane
      do {
        const u = random();
        const v = random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      } while (Math.abs(y) < 2500); 
      
      data.push({
        position: new THREE.Vector3(x, y, z),
        texture,
        size: 500 + random() * 500, // Size between 500 and 1000 units
        zRot: random() * Math.PI * 2,
        opacityBonus: random() * 0.3
      });
    }
    
    return data;
  }, []);

  return (
    <group>
      {galaxiesData.map((data, i) => (
        <Galaxy key={i} data={data} camera={camera} />
      ))}
    </group>
  );
}
