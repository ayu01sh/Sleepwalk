import * as THREE from 'three';

/**
 * Calculates the current orbital position of a planet based on time.
 * @param {Array} initialPosition - The [x, y, z] starting position of the planet
 * @param {number} time - Current elapsed time in seconds (e.g., from clock.elapsedTime)
 * @param {THREE.Vector3} [targetVector] - Optional vector to reuse for performance
 * @returns {THREE.Vector3} The new world position of the planet
 */
export function getOrbitPosition(initialPosition, time, targetVector = new THREE.Vector3()) {
  const [x0, y0, z0] = initialPosition;
  
  // Calculate orbital radius on the XZ plane
  const radius = Math.sqrt(x0 * x0 + z0 * z0);
  
  // If the object is exactly at 0,0,0 (like the Sun), it doesn't orbit
  if (radius === 0) {
    return targetVector.set(x0, y0, z0);
  }

  // Determine starting angle in radians
  const startAngle = Math.atan2(z0, x0);
  
  // Orbital speed is inversely proportional to the square root of the distance
  // (Simulates Kepler's third law conceptually)
  // Multiplier tweaks the overall speed of the solar system (decreased by 80%)
  const speed = 4 / Math.sqrt(radius);
  
  // Current angle
  const currentAngle = startAngle + time * speed;
  
  // Calculate new coordinates
  const x = radius * Math.cos(currentAngle);
  const z = radius * Math.sin(currentAngle);
  
  return targetVector.set(x, y0, z);
}
