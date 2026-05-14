import * as THREE from 'three';

// Basic vertex shader for particles
const vertexShader = `
  uniform float uTime;
  attribute float size;
  attribute vec3 velocity;
  varying vec3 vColor;
  
  void main() {
    vColor = vec3(0.83, 0.66, 0.33); // golden color
    
    vec3 pos = position;
    // Add simple movement based on velocity and time
    pos.y += velocity.y * uTime * 0.1;
    pos.x += sin(uTime * velocity.x) * 0.1;
    pos.z += cos(uTime * velocity.z) * 0.1;
    
    // Wrap around y
    if (pos.y > 3.0) {
      pos.y = mod(pos.y, 3.0) - 0.5;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for soft circular particles
const fragmentShader = `
  uniform float uOpacity;
  varying vec3 vColor;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = smoothstep(0.5, 0.1, dist) * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particleCount = 100;
    
    this.initParticles();
  }
  
  initParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      // Random positions (mostly near the center)
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = Math.random() * 3 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 2;
      velocities[i * 3 + 1] = Math.random() * 0.5 + 0.1; // Mostly upward
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      // Random sizes
      sizes[i] = Math.random() * 0.05 + 0.02;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.5 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);
    
    // Target opacity per phase
    this.phaseOpacities = [
      0.8, // Phase 0
      0.6, // Phase 1
      0.5, // Phase 2
      0.3, // Phase 3
      0.1, // Phase 4 (interview - clean)
      0.7, // Phase 5 (future - dreamy)
      0.4  // Phase 6 (final)
    ];
  }
  
  update(scrollProgress, currentPhaseIndex, localProgress) {
    // We update time in the main loop, here we update phase specific stuff
    const targetOpacity = this.phaseOpacities[currentPhaseIndex] || 0.5;
    
    // Smoothly transition opacity
    this.material.uniforms.uOpacity.value += (targetOpacity - this.material.uniforms.uOpacity.value) * 0.05;
  }
  
  tick(time) {
    if (this.material) {
      this.material.uniforms.uTime.value = time;
    }
  }
}
