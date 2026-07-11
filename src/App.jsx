import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Starfield from './components/Starfield';
import Astronaut from './components/Astronaut';
import CameraRig from './components/CameraRig';
import Controls from './components/Controls';
import CinematicIntro from './components/CinematicIntro';
import ControlsHint from './ui/ControlsHint';
import Minimap from './ui/Minimap';
import PostProcessing from './components/PostProcessing';
import MuseumSystem from './components/MuseumSystem';
import AudioEngine from './components/AudioEngine';

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
        
        <ambientLight intensity={0.12} />
        
        <MuseumSystem astronautRef={astronautRef} />
        
        <Astronaut ref={astronautRef} position={[40, 0, 60]} />
        <CameraRig targetRef={astronautRef} />
        <Controls targetRef={astronautRef} />
        <CinematicIntro targetRef={astronautRef} />
        
        <PostProcessing />
        
      </Suspense>
    </Canvas>
    <ControlsHint />
    <Minimap astronautRef={astronautRef} />
    <AudioEngine />
    </>
  );
}

export default App;
