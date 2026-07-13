import { Stars } from '@react-three/drei';
import { NEBULA_CENTER } from '../data/nebulaData';
import { useStore } from '../store/useStore';

export default function Starfield() {
  const quality = useStore(state => state.quality);
  const coreCount = quality === 'high' ? 80000 : 30000;
  const bgCount = quality === 'high' ? 30000 : 10000;

  return (
    <>
      {/* Universal Starfield covering the entire map (Sun to Black Hole) */}
      <group position={[1500, 0, 1500]}>
        {/* Core stars filling the entire volume */}
        <Stars 
          radius={50} 
          depth={6000} 
          count={coreCount} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.5} 
        />
        {/* Colorful deep space background stars mixed throughout */}
        <Stars 
          radius={50} 
          depth={6000} 
          count={bgCount} 
          factor={6} 
          saturation={0.8} 
          fade 
          speed={0.2} 
        />
      </group>

      {/* Basic dark background */}
      <color attach="background" args={['#000005']} />
    </>
  );
}
