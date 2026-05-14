import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Custom shader for Film Grain and Vignette
const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uAmount: { value: 0.08 }, // grain amount
    uVignetteOffset: { value: 1.0 },
    uVignetteDarkness: { value: 1.5 }
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
    uniform float uTime;
    uniform float uAmount;
    uniform float uVignetteOffset;
    uniform float uVignetteDarkness;
    varying vec2 vUv;

    // Pseudo-random noise for grain
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      // Add Grain
      float noise = (random(vUv + uTime) - 0.5) * uAmount;
      texel.rgb += noise;
      
      // Add Vignette
      vec2 dist = vUv - 0.5;
      texel.rgb *= smoothstep(0.8, uVignetteOffset * 0.1, length(dist) * uVignetteDarkness);
      
      gl_FragColor = texel;
    }
  `
};

export class PostProcessingSystem {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    
    // Render Pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);
    
    // Bloom Pass
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.bloomPass = new UnrealBloomPass(resolution, 0.4, 0.5, 0.2); // strength, radius, threshold
    this.composer.addPass(this.bloomPass);
    
    // Custom Cinematic Pass (Grain & Vignette)
    this.cinematicPass = new ShaderPass(CinematicShader);
    this.composer.addPass(this.cinematicPass);
  }
  
  resize(width, height) {
    this.composer.setSize(width, height);
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }
  
  update(deltaTime, elapsedTime) {
    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uTime.value = elapsedTime;
    }
  }
  
  render() {
    this.composer.render();
  }
}
