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
import ShootingStars from './components/ShootingStars';
import Comets from './components/Comets';
import DistantGalaxies from './components/DistantGalaxies';
import NebulaCloud from './components/NebulaCloud';
import MonolithGallery from './components/MonolithGallery';
import BlackHole from './components/BlackHole';
import AudioEngine from './components/AudioEngine';
import MobileControls from './ui/MobileControls';
import WaypointHUD from './ui/WaypointHUD';
import QualityToggle from './ui/QualityToggle';
import MinimapHUD from './ui/MinimapHUD';
import VisorHUD from './ui/VisorHUD';
import Voyager from './components/Voyager';

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
      dpr={quality === 'high' ? [1, 2] : [0.5, 1]}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.0,
        autoClear: false,
      }}
    >
      <Suspense fallback={null}>
        <Starfield />
        <DistantGalaxies />
        <ShootingStars astronautRef={astronautRef} />
        <Comets />
        
        <ambientLight intensity={0.12} />
        
        <BlackHole astronautRef={astronautRef} />
      
      {/* Easter Egg / Phase 2: Voyager 1 */}
      <Voyager position={[1500, 50, -2000]} astronautRef={astronautRef} />
        <MuseumSystem astronautRef={astronautRef} />
        <NebulaCloud />
        <MonolithGallery />
        <BlackHole />
        
        <Astronaut ref={astronautRef} position={[0, 30, 2100]} />
        <CameraRig targetRef={astronautRef} />
        <Controls targetRef={astronautRef} />
        <CinematicIntro targetRef={astronautRef} />
        
        {quality === 'high' && <PostProcessing />}
        <AdaptiveDpr pixelated />
        
        <NavigationArrow astronautRef={astronautRef} />
        
      </Suspense>
    </Canvas>
    <WaypointHUD astronautRef={astronautRef} />
    <MinimapHUD astronautRef={astronautRef} />
    <QualityToggle />
    <MobileControls />
    <VisorHUD />
    <AudioEngine astronautRef={astronautRef} />
    </>
  );
}

export default App;
