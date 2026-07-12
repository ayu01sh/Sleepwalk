varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

attribute vec3 instancePosition;
attribute vec3 instanceColor;
attribute float instanceAlpha;
attribute float instanceScale;

uniform float time;

void main() {
  vUv = uv;
  vColor = instanceColor;
  vAlpha = instanceAlpha;
  
  // Start with the instance position
  vec4 instancePos = vec4(instancePosition, 1.0);
  
  // Add slow drift animation based on time and position
  instancePos.x += sin(time * 0.2 + instancePos.z * 0.05) * 5.0;
  instancePos.y += cos(time * 0.15 + instancePos.x * 0.05) * 5.0;
  instancePos.z += sin(time * 0.25 + instancePos.y * 0.05) * 5.0;
  
  // Billboarding: extract camera right and up vectors from modelViewMatrix
  vec4 mvPosition = viewMatrix * modelMatrix * instancePos;
  
  // Expand the quad based on the particle scale
  mvPosition.xyz += position * instanceScale;

  gl_Position = projectionMatrix * mvPosition;
}
