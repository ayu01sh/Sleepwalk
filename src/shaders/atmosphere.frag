varying vec3 vNormal;
varying vec3 vPositionNormal;

void main() {
  // Calculate Fresnel effect (stronger at edges)
  float intensity = pow(0.65 - dot(vNormal, vPositionNormal), 4.0);
  
  // Base atmosphere color (soft blue)
  vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
  
  gl_FragColor = vec4(atmosphereColor, 1.0) * intensity;
}
