import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useMovement } from '../hooks/useMovement';
import { useStore } from '../store/useStore';

const ACCELERATION = 0.05;
const DAMPING = 0.97;
const MOUSE_SENSITIVITY = 0.002;

export default function Controls({ targetRef }) {
  const { gl } = useThree();
  const introComplete = useStore((state) => state.introComplete);
  const getKeys = useMovement();
  const velocity = useRef(new THREE.Vector3());
  const pitch = useRef(0);
  const yaw = useRef(0);
  const isLocked = useRef(false);

  // Pre-allocated vectors to avoid GC pressure in the render loop
  const _inputDir = useRef(new THREE.Vector3());
  const _localDir = useRef(new THREE.Vector3());
  const _euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const _moveDelta = useRef(new THREE.Vector3());

  useEffect(() => {
    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };
    
    const handlePointerDown = () => {
      if (!isLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };

    // --- Mouse Panning (Pointer Lock) ---
    const handleMouseMove = (e) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      const maxPitch = Math.PI / 2 - 0.1;
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    };

    // --- Touch Panning (Mobile) ---
    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e) => {
      // Only care about the first touch on the canvas
      if (e.touches.length > 0) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      // Prevent default scrolling when swiping on the canvas
      e.preventDefault();
      
      if (e.touches.length > 0) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        const deltaX = touchX - lastTouchX;
        const deltaY = touchY - lastTouchY;
        
        // Touch sensitivity can be slightly higher than mouse
        yaw.current -= deltaX * MOUSE_SENSITIVITY * 2;
        pitch.current -= deltaY * MOUSE_SENSITIVITY * 2;
        
        const maxPitch = Math.PI / 2 - 0.1;
        pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
        
        lastTouchX = touchX;
        lastTouchY = touchY;
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    gl.domElement.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Bind touch events to canvas
    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    gl.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!introComplete || !targetRef.current) return;

    // 1. Build input direction vector (reuse pre-allocated)
    const keys = getKeys();
    const inputDir = _inputDir.current.set(0, 0, 0);
    if (keys.right) inputDir.x += 1;
    if (keys.left) inputDir.x -= 1;
    if (keys.ascend) inputDir.y += 1;
    if (keys.descend) inputDir.y -= 1;
    if (keys.backward) inputDir.z += 1;
    if (keys.forward) inputDir.z -= 1;

    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
    }

    // 2. Set rotation based on mouse (reuse pre-allocated Euler)
    _euler.current.set(pitch.current, yaw.current, 0);
    targetRef.current.quaternion.setFromEuler(_euler.current);

    // 3. Transform input direction to local space (reuse pre-allocated)
    const localDir = _localDir.current.copy(inputDir).applyQuaternion(targetRef.current.quaternion);
    
    // 4. Add to velocity (apply warp boost if Shift is held)
    const currentAccel = keys.boost ? ACCELERATION * 30 : ACCELERATION;
    velocity.current.add(localDir.multiplyScalar(currentAccel));

    // 5. Apply damping
    velocity.current.multiplyScalar(DAMPING);

    // 6. Update position (reuse pre-allocated)
    const moveDelta = _moveDelta.current.copy(velocity.current).multiplyScalar(delta * 60);
    targetRef.current.position.add(moveDelta);
  });

  return null;
}
