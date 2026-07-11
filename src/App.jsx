import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Starfield from './components/Starfield';
import Earth from './components/Earth';
import Astronaut from './components/Astronaut';
import CameraRig from './components/CameraRig';
import Controls from './components/Controls';
import CinematicIntro from './components/CinematicIntro';
import ControlsHint from './ui/ControlsHint';
import PostProcessing from './components/PostProcessing';

function App() {
  const astronautRef = useRef();
  
  return (
    <>
    <Canvas
      camera={{ fov: 60, near: 0.1, far: 10000, position: [0, 2, 10] }}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.0,
        autoClear: false,
      }}
    >
      <Suspense fallback={null}>
        <Starfield />
        
        {/* Lighting Rig — sun positioned to illuminate Earth's camera-facing side */}
        <ambientLight intensity={0.12} />
        <directionalLight
          position={[-30, 15, -20]}
          intensity={3.0}
          color="#fff5e6"
          castShadow={false}
        />
        
        <Earth />
        
        <Astronaut ref={astronautRef} />
        <CameraRig targetRef={astronautRef} />
        <Controls targetRef={astronautRef} />
        <CinematicIntro targetRef={astronautRef} />
        
        <PostProcessing />
        
      </Suspense>
    </Canvas>
    <ControlsHint />
    </>
  );
}

export default App;
