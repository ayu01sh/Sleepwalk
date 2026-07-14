import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useMovement() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const setMovement = useStore.getState().setMovement;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement('forward', true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMovement('backward', true);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMovement('left', true);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMovement('right', true);
          break;
        case 'Space':
          setMovement('ascend', true);
          break;
        case 'ControlLeft':
        case 'ControlRight':
        case 'KeyC':
          setMovement('descend', true);
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setMovement('boost', true);
          break;
        case 'KeyV':
          useStore.getState().toggleFirstPerson();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      const setMovement = useStore.getState().setMovement;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement('forward', false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMovement('backward', false);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMovement('left', false);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMovement('right', false);
          break;
        case 'Space':
          setMovement('ascend', false);
          break;
        case 'ControlLeft':
        case 'ControlRight':
        case 'KeyC':
          setMovement('descend', false);
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setMovement('boost', false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Return a getter function to read the state without triggering React re-renders in the caller
  return () => useStore.getState().movement;
}
