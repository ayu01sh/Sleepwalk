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
  const keys = useMovement();
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

    const handleMouseMove = (e) => {
      if (!isLocked.current) return;
      
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      
      // Clamp pitch to avoid flipping over (±80 degrees)
      const maxPitch = Math.PI / 2 - 0.1;
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    gl.domElement.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      gl.domElement.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl.domElement]);

  useFrame((state, delta) => {
    if (!introComplete || !targetRef.current) return;

    // 1. Build input direction vector (reuse pre-allocated)
    const inputDir = _inputDir.current.set(0, 0, 0);
    if (keys.current.right) inputDir.x += 1;
    if (keys.current.left) inputDir.x -= 1;
    if (keys.current.ascend) inputDir.y += 1;
    if (keys.current.descend) inputDir.y -= 1;
    if (keys.current.backward) inputDir.z += 1;
    if (keys.current.forward) inputDir.z -= 1;

    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
    }

    // 2. Set rotation based on mouse (reuse pre-allocated Euler)
    _euler.current.set(pitch.current, yaw.current, 0);
    targetRef.current.quaternion.setFromEuler(_euler.current);

    // 3. Transform input direction to local space (reuse pre-allocated)
    const localDir = _localDir.current.copy(inputDir).applyQuaternion(targetRef.current.quaternion);
    
    // 4. Add to velocity (apply warp boost if Shift is held)
    const currentAccel = keys.current.boost ? ACCELERATION * 30 : ACCELERATION;
    velocity.current.add(localDir.multiplyScalar(currentAccel));

    // 5. Apply damping
    velocity.current.multiplyScalar(DAMPING);

    // 6. Update position (reuse pre-allocated)
    const moveDelta = _moveDelta.current.copy(velocity.current).multiplyScalar(delta * 60);
    targetRef.current.position.add(moveDelta);
  });

  return null;
}
