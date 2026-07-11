import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export default function CinematicIntro({ targetRef }) {
  const { camera } = useThree();
  const setIntroComplete = useStore((state) => state.setIntroComplete);
  const introComplete = useStore((state) => state.introComplete);
  const setShowControlsHint = useStore((state) => state.setShowControlsHint);
  
  const timer = useRef(0);
  const startPos = useRef(new THREE.Vector3(0, 5, 30));

  // Pre-allocated vectors to avoid GC pressure
  const _targetPos = useRef(new THREE.Vector3());
  const _finalOffset = useRef(new THREE.Vector3());
  const _finalPos = useRef(new THREE.Vector3());
  const _lookTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = () => {
      if (!introComplete) {
        setIntroComplete();
        setShowControlsHint(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [introComplete, setIntroComplete, setShowControlsHint]);

  useFrame((state, delta) => {
    if (introComplete) return;
    
    timer.current += delta;
    
    if (timer.current > 6) {
      setIntroComplete();
      setShowControlsHint(true);
      return;
    }

    if (!targetRef.current) return;

    // Intro camera animation (reuse pre-allocated vectors)
    targetRef.current.getWorldPosition(_targetPos.current);
    
    _finalOffset.current.set(0, 1.5, 5);
    _finalOffset.current.applyQuaternion(targetRef.current.quaternion);
    _finalPos.current.copy(_targetPos.current).add(_finalOffset.current);

    // Interpolate from startPos to finalPos over 5 seconds
    const progress = Math.min(timer.current / 5, 1);
    const ease = THREE.MathUtils.smoothstep(progress, 0, 1);
    
    camera.position.lerpVectors(startPos.current, _finalPos.current, ease);
    
    _lookTarget.current.set(
      _targetPos.current.x,
      _targetPos.current.y + 1,
      _targetPos.current.z
    );
    camera.lookAt(_lookTarget.current);
  });

  return null;
}
