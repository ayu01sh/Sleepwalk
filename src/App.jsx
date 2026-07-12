import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useEffect } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from './store/useStore';
import { fetchGalleryImages } from './services/nasaApi';
import Starfield from './components/Starfield';
import Astronaut from './components/Astronaut';
import CameraRig from './components/CameraRig';
import Controls from './components/Controls';
import CinematicIntro from './components/CinematicIntro';
import NavigationArrow from './components/NavigationArrow';
import PostProcessing from './components/PostProcessing';
import MuseumSystem from './components/MuseumSystem';
import NebulaCloud from './components/NebulaCloud';
import MonolithGallery from './components/MonolithGallery';
import BlackHole from './components/BlackHole';
import AudioEngine from './components/AudioEngine';
import MobileControls from './ui/MobileControls';
import WaypointHUD from './ui/WaypointHUD';
import QualityToggle from './ui/QualityToggle';

function App() {
  const astronautRef = useRef();
  const quality = useStore(state => state.quality);

  useEffect(() => {
    fetchGalleryImages().then(images => {
      useStore.getState().setNasaImages(images);
      useStore.getState().setNasaImagesLoaded(true);
    });
  }, []);
  
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
        <NebulaCloud />
        <MonolithGallery />
        <BlackHole />
        
        <Astronaut ref={astronautRef} position={[40, 0, 60]} />
        <CameraRig targetRef={astronautRef} />
        <Controls targetRef={astronautRef} />
        <CinematicIntro targetRef={astronautRef} />
        
        {quality === 'high' && <PostProcessing />}
        <AdaptiveDpr pixelated />
        
        <NavigationArrow astronautRef={astronautRef} />
        
      </Suspense>
    </Canvas>
    <WaypointHUD astronautRef={astronautRef} />
    <QualityToggle />
    <MobileControls />
    <AudioEngine astronautRef={astronautRef} />
    </>
  );
}

export default App;
