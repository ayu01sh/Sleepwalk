import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

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

export default function PostProcessing() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    comp.setSize(size.width, size.height);

    // 1. Render pass
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // 2. Bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.0,    // strength
      0.4,    // radius
      0.85    // threshold
    );
    comp.addPass(bloomPass);

    // 3. Vignette
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.renderToScreen = true;
    comp.addPass(vignettePass);

    return comp;
  }, [gl, scene, camera]);

  // Handle resize
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Override the default render loop
  useFrame(() => {
    composer.render();
  }, 1); // priority 1 = runs after default render

  return null;
}
