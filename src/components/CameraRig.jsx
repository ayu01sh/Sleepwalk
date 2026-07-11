import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { useStore } from '../store/useStore';

export default function CameraRig({ targetRef }) {
  const { camera } = useThree();
  const introComplete = useStore((state) => state.introComplete);
  const lookAtVec = useRef(new THREE.Vector3());

  // Pre-allocated vectors to avoid GC pressure in the render loop
  const _targetPos = useRef(new THREE.Vector3());
  const _idealOffset = useRef(new THREE.Vector3());
  const _idealLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!introComplete || !targetRef.current) return;

    // 1. Get the character's position (reuse pre-allocated)
    targetRef.current.getWorldPosition(_targetPos.current);

    // 2. Define the ideal camera offset (behind and above)
    _idealOffset.current.set(0, 1.5, 5);
    _idealOffset.current.applyQuaternion(targetRef.current.quaternion);
    _idealOffset.current.add(_targetPos.current);

    // 3. Smoothly interpolate the camera position
    camera.position.lerp(_idealOffset.current, 5 * delta);

    // 4. Smoothly interpolate lookAt target
    _idealLookAt.current.copy(_targetPos.current).add(_idealLookAt.current.set(0, 1, 0));
    // Fix: set idealLookAt properly
    _idealLookAt.current.set(
      _targetPos.current.x,
      _targetPos.current.y + 1,
      _targetPos.current.z
    );
    lookAtVec.current.lerp(_idealLookAt.current, 5 * delta);
    camera.lookAt(lookAtVec.current);
  });

  return null;
}
