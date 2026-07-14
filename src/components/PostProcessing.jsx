import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { useStore } from '../store/useStore';

// Simple vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.15 },
    darkness: { value: 0.85 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float dist = length(uv);
      texel.rgb *= smoothstep(0.8, offset * 0.799, dist * (darkness + offset));
      gl_FragColor = texel;
    }
  `,
};

// Relativistic Distortion & Redshift Shader
const RelativityShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.0 }, // 0 to 1 based on proximity
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      if (intensity <= 0.001) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec2 uv = vUv;
      
      // 1. Radial/Gravitational Lensing Distortion
      vec2 center = vec2(0.5, 0.5);
      vec2 distVec = uv - center;
      float dist = length(distVec);
      
      // Pull pixels towards the center (or push away) based on intensity
      // A simple bulge/pinch effect
      float distortion = 1.0 - (intensity * 0.5 * smoothstep(0.5, 0.0, dist));
      vec2 distortedUv = center + distVec * distortion;
      
      // 2. Chromatic Aberration (Redshift / Blueshift)
      // Redshift shifts the spectrum towards red. We simulate this by separating the RGB channels radially.
      float aberrationAmount = intensity * 0.05 * dist;
      
      // Red channel pulled inwards (redshift)
      vec2 rUv = center + (distortedUv - center) * (1.0 - aberrationAmount);
      // Blue channel pushed outwards
      vec2 bUv = center + (distortedUv - center) * (1.0 + aberrationAmount);
      // Green channel stays roughly the same
      vec2 gUv = distortedUv;
      
      float r = texture2D(tDiffuse, rUv).r;
      float g = texture2D(tDiffuse, gUv).g;
      float b = texture2D(tDiffuse, bUv).b;
      
      // Global redshift tinting
      // As intensity goes up, reduce blue and green globally
      float rTint = 1.0 + (intensity * 0.5);
      float gTint = 1.0 - (intensity * 0.3);
      float bTint = 1.0 - (intensity * 0.8);
      
      gl_FragColor = vec4(r * rTint, g * gTint, b * bTint, 1.0);
    }
  `,
};

export default function PostProcessing() {
  const { gl, scene, camera, size } = useThree();
  const inNebulaZone = useStore(state => state.inNebulaZone);
  const quality = useStore(state => state.quality);

  const { composer, bloomPass, relativityPass } = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.setSize(size.width, size.height);

    // 1. Render pass
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // 2. Bloom
    const bloomRes = quality === 'high' 
      ? new THREE.Vector2(size.width, size.height) 
      : new THREE.Vector2(size.width / 2, size.height / 2);
      
    const bloomPass = new UnrealBloomPass(
      bloomRes,
      1.0,    // strength
      0.4,    // radius
      0.85    // threshold
    );
    comp.addPass(bloomPass);

    // 3. Relativity Shader Pass
    const relativityPass = new ShaderPass(RelativityShader);
    comp.addPass(relativityPass);

    // 4. Vignette Pass
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.renderToScreen = true;
    comp.addPass(vignettePass);

    return { composer: comp, bloomPass, relativityPass };
  }, [gl, scene, camera, quality, size.width, size.height]);

  // Handle resize
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Override the default render loop
  useFrame((state, delta) => {
    if (bloomPass && relativityPass) {
      const targetStrength = inNebulaZone ? 1.5 : 1.0;
      const targetThreshold = inNebulaZone ? 0.6 : 0.85;
      
      bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, targetStrength, 2 * delta);
      bloomPass.threshold = THREE.MathUtils.lerp(bloomPass.threshold, targetThreshold, 2 * delta);
      relativityPass.uniforms.intensity.value = useStore.getState().relativityIntensity;
    }
    composer.render();
  }, 1); // priority 1 = runs after default render

  return null;
}
