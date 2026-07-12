varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Center is 0.5, 0.5
  vec2 center = vUv - vec2(0.5);
  float dist = length(center);
  
  // Soft radial gradient: 1.0 at center, 0.0 at radius 0.5
  float strength = smoothstep(0.5, 0.1, dist);
  
  // Final alpha is base alpha * radial strength
  float finalAlpha = vAlpha * strength;
  
  // Prevent rendering completely transparent pixels
  if (finalAlpha < 0.01) discard;
  
  // Use additive blending in material, so we just output color and alpha
  gl_FragColor = vec4(vColor, finalAlpha);
}
