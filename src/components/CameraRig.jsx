import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function CameraRig({ targetRef }) {
  const { camera, gl } = useThree();
  const introComplete = useStore((state) => state.introComplete);
  const movement = useStore((state) => state.movement);
  const lookAtVec = useRef(new THREE.Vector3());
  const zoomDistance = useRef(5);

  const BASE_FOV = 60;
  const WARP_FOV = 110;

  // Pre-allocated vectors to avoid GC pressure in the render loop
  const _targetPos = useRef(new THREE.Vector3());
  const _idealOffset = useRef(new THREE.Vector3());
  const _idealLookAt = useRef(new THREE.Vector3());

  // Listen for scroll events to adjust zoom
  useEffect(() => {
    const handleWheel = (e) => {
      // e.deltaY is positive when scrolling down (zoom out), negative when scrolling up (zoom in)
      const zoomSpeed = 0.01;
      let newZoom = zoomDistance.current + e.deltaY * zoomSpeed;
      
      // Clamp zoom distance
      newZoom = Math.max(2, Math.min(newZoom, 20));
      
      zoomDistance.current = newZoom;
    };

    // Attach to the canvas specifically so we don't interfere with standard DOM scrolling if any
    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl.domElement]);

  useEffect(() => {
    useStore.getState().setCamera(camera);
  }, [camera]);

  useFrame((state, delta) => {
    if (!introComplete || !targetRef.current) return;

    // --- Warp FOV Stretching ---
    const targetFov = movement.boost ? WARP_FOV : BASE_FOV;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 3 * delta);
    camera.updateProjectionMatrix();

    // 1. Get the character's position (reuse pre-allocated)
    targetRef.current.getWorldPosition(_targetPos.current);

    const isFirstPerson = useStore.getState().isFirstPerson;

    if (isFirstPerson) {
      _idealOffset.current.set(0, 0.5, -0.5);
      _idealOffset.current.applyQuaternion(targetRef.current.quaternion);
      _idealOffset.current.add(_targetPos.current);
      
      _idealLookAt.current.set(0, 0.5, -10);
      _idealLookAt.current.applyQuaternion(targetRef.current.quaternion);
      _idealLookAt.current.add(_targetPos.current);
      
      camera.position.lerp(_idealOffset.current, 20 * delta);
      lookAtVec.current.lerp(_idealLookAt.current, 20 * delta);
    } else {
      const heightOffset = 1.5 + (zoomDistance.current - 5) * 0.2;
      _idealOffset.current.set(0, heightOffset, zoomDistance.current);
      _idealOffset.current.applyQuaternion(targetRef.current.quaternion);
      _idealOffset.current.add(_targetPos.current);

      camera.position.lerp(_idealOffset.current, 5 * delta);

      _idealLookAt.current.set(
        _targetPos.current.x,
        _targetPos.current.y + 1,
        _targetPos.current.z
      );
      lookAtVec.current.lerp(_idealLookAt.current, 5 * delta);
    }

    camera.lookAt(lookAtVec.current);
  });

  return null;
}
