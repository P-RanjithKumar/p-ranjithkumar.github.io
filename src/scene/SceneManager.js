import * as THREE from 'three';
import { PostProcessingSystem } from './PostProcessingSystem.js';

export class SceneManager {
  constructor(canvasElement) {
    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // Cinematic rendering settings
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 2. Scene
    this.scene = new THREE.Scene();
    
    // 3. Camera
    // FOV 45 is good for portraits/cinematic feel
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1, 5); // Initial position
    
    // 4. Post-Processing
    this.postProcessing = new PostProcessingSystem(this.renderer, this.scene, this.camera);
    
    // Internal state
    this.clock = new THREE.Clock();
    this.updateCallback = null;
    
    // Bind methods
    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    
    // Event listeners
    window.addEventListener('resize', this.resize);
  }
  
  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    if (this.postProcessing) {
      this.postProcessing.resize(width, height);
    }
  }
  
  startLoop(updateCallback) {
    this.updateCallback = updateCallback;
    this.renderer.setAnimationLoop(this.render);
  }
  
  render() {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }
    
    if (this.postProcessing) {
      this.postProcessing.update(deltaTime, elapsedTime);
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
