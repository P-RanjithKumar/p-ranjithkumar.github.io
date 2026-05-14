import * as THREE from 'three';
import { math } from '../utils/math.js';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    
    // 1. Ambient Light (very dim, provides base visibility)
    this.ambientLight = new THREE.AmbientLight(0xfff5e6, 0.05);
    this.scene.add(this.ambientLight);
    
    // 2. Key Light (warm front-side)
    this.keyLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    this.keyLight.position.set(2, 3, 4);
    this.scene.add(this.keyLight);
    
    // 3. Rim Light (golden edge, starts off)
    this.rimLight = new THREE.SpotLight(0xd4a855, 0);
    this.rimLight.position.set(-2, 2, -2);
    this.rimLight.angle = Math.PI / 4;
    this.rimLight.penumbra = 0.5;
    this.scene.add(this.rimLight);
    
    // 4. Fill Light (subtle soft fill)
    this.fillLight = new THREE.DirectionalLight(0xfff8f0, 0.05);
    this.fillLight.position.set(-1, 1, 2);
    this.scene.add(this.fillLight);
    
    // 5. Lower Body Glow (warmth for body below chest)
    this.floorGlow = new THREE.PointLight(0xd4a855, 0.2, 8);
    this.floorGlow.position.set(0, 0.8, 1.5);
    this.scene.add(this.floorGlow);
    
    // 6. Face Spotlight (starts dark, brightens softly at the end)
    this.faceLight = new THREE.SpotLight(0xfff0e6, 0);
    this.faceLight.position.set(0, 2.5, 2);
    this.faceLight.target.position.set(0, 2.0, 0);
    this.faceLight.angle = Math.PI / 10; // Narrower angle to focus strictly on the face
    this.faceLight.penumbra = 1.0; // Maximum softness so it isn't harsh
    this.scene.add(this.faceLight);
    this.scene.add(this.faceLight.target);
    
    // Lighting Keyframes per phase
    this.keyframes = [
      // Phase 0: Arrival (dim, lower body glow)
      { ambient: 0.0, key: 0.0, rim: 0.0, fill: 0.0, floor: 0.8, face: 0.0 },
      // Phase 1: Reveal (rising lights)
      { ambient: 0.0, key: 0.0, rim: 0.1, fill: 0.0, floor: 0.6, face: 0.0 },
      // Phase 2: Love (warm side glow)
      { ambient: 0.0, key: 0.0, rim: 0.3, fill: 0.0, floor: 0.6, face: 0.0 },
      // Phase 3: Strength (cleaner, brighter)
      { ambient: 0.0, key: 0.0, rim: 0.5, fill: 0.0, floor: 0.6, face: 0.0 },
      // Phase 4: Interview (confident bright)
      { ambient: 0.0, key: 0.0, rim: 0.6, fill: 0.0, floor: 0.7, face: 0.0 },
      // Phase 5: Future (dreamy, diffused)
      { ambient: 0.0, key: 0.0, rim: 0.4, fill: 0.0, floor: 0.7, face: 0.0 },
      // Phase 6: Final (balanced glow)
      { ambient: 0.0, key: 0.0, rim: 0.5, fill: 0.0, floor: 0.8, face: 0.0 }
    ];
  }
  
  update(scrollProgress, currentPhaseIndex, localProgress) {
    // Determine the transition between the current phase and the next phase
    const nextPhaseIndex = Math.min(currentPhaseIndex + 1, this.keyframes.length - 1);
    
    const startObj = this.keyframes[currentPhaseIndex];
    const endObj = this.keyframes[nextPhaseIndex];
    
    // Interpolate light intensities
    this.ambientLight.intensity = math.lerp(startObj.ambient, endObj.ambient, localProgress);
    this.keyLight.intensity = math.lerp(startObj.key, endObj.key, localProgress);
    this.rimLight.intensity = math.lerp(startObj.rim, endObj.rim, localProgress);
    this.fillLight.intensity = math.lerp(startObj.fill, endObj.fill, localProgress);
    this.floorGlow.intensity = math.lerp(startObj.floor, endObj.floor, localProgress);
    this.faceLight.intensity = math.lerp(startObj.face, endObj.face, localProgress);
  }
}
