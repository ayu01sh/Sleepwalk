import { Stars } from '@react-three/drei';

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
      
      {/* Basic dark background */}
      <color attach="background" args={['#000008']} />
    </>
  );
}
