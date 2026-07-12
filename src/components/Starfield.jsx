import { Stars } from '@react-three/drei';
import { NEBULA_CENTER } from '../data/nebulaData';

export default function Starfield() {
  return (
    <>
      {/* Universal Starfield covering the entire map (Sun to Black Hole) */}
      <group position={[1500, 0, 1500]}>
        {/* Core stars filling the entire volume */}
        <Stars 
          radius={50} 
          depth={6000} 
          count={80000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.5} 
        />
        {/* Colorful deep space background stars mixed throughout */}
        <Stars 
          radius={50} 
          depth={6000} 
          count={30000} 
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
