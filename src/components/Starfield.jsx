import { Stars } from '@react-three/drei';
import { NEBULA_CENTER } from '../data/nebulaData';

export default function Starfield() {
  return (
    <>
      <Stars 
        radius={300} 
        depth={100} 
        count={8000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />
      
      {/* Nebula deep space layer */}
      <group position={NEBULA_CENTER}>
        <Stars 
          radius={600} 
          depth={200} 
          count={12000} 
          factor={6} 
          saturation={0.8} 
          fade 
          speed={0.2} 
        />
      </group>

      {/* Basic dark background */}
      <color attach="background" args={['#000008']} />
    </>
  );
}
