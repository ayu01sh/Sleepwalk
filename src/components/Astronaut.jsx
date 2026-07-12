import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const Astronaut = React.forwardRef((props, ref) => {
  const meshRef = useRef();
  const { scene } = useGLTF('/models/astronaut.glb');

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle hover/bob + gentle roll drift for weightless feel
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.15;
      meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={ref} {...props}>
      <group ref={meshRef}>
        {/* Local light so the astronaut is always visible */}
        <pointLight position={[0, 0.5, 2]} intensity={21} distance={10} color="#ffffff" />
        <primitive object={scene} scale={0.5} position={[0, -0.5, 0]} rotation={[0, Math.PI, 0]} />
      </group>
    </group>
  );
});

useGLTF.preload('/models/astronaut.glb');

export default Astronaut;
