import * as THREE from 'three';

export class HeartSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.count = 80;
    this.hearts = [];
    this.isScrolling = false;
    this.lastScrollY = 0;
    this.scrollTimeout = null;

    this.init();
  }

  init() {
    // Create a 3D-aware heart shape geometry
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo( x + 5, y + 5 );
    shape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    shape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
    shape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    shape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    shape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    shape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

    const geometry = new THREE.ShapeGeometry( shape );
    geometry.center();
    geometry.scale(0.015, 0.015, 0.015);
    geometry.rotateZ(Math.PI);

    // Provide per-instance opacity
    const opacities = new Float32Array(this.count);
    geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacities, 1));

    // Custom shader material for magical sparkling & glittering effects
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float instanceOpacity;
        varying float vOpacity;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vOpacity = instanceOpacity;
          
          // Magical glittering effect on the color
          float glitter = 0.7 + 0.6 * sin(time * 15.0 + float(gl_InstanceID) * 12.34);
          // Yellow / Gold magical color
          vColor = vec3(1.0, 0.85, 0.2) * glitter; 
          
          vec4 mvPosition = viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        
        void main() {
          if (vOpacity <= 0.01) discard;
          
          // Soften the edges slightly for a magical glow feel
          gl_FragColor = vec4(vColor, vOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
    this.mesh.frustumCulled = false; // Prevent culling when camera orbits away from origin
    this.scene.add(this.mesh);

    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < this.count; i++) {
      this.hearts.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        rotation: new THREE.Vector3(),
        rotSpeed: new THREE.Vector3(),
        scale: 0,
        baseScale: Math.random() * 0.4 + 0.3,
        state: 'hidden', 
        animTimer: 0,
        delay: Math.random() * 0.2
      });
      dummy.position.set(0, 0, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      opacities[i] = 0;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  tick(time, deltaTime, currentScrollY) {
    if (!this.mesh) return;
    
    this.mesh.material.uniforms.time.value = time;

    // Determine scrolling state based on delta Y
    const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);
    this.lastScrollY = currentScrollY;

    if (scrollDelta > 0.5) {
      this.isScrolling = true;
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      // Wait shortly after scrolling stops to trigger disappear zooooop
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150); 
    }

    const dummy = new THREE.Object3D();
    const opacities = this.mesh.geometry.attributes.instanceOpacity.array;
    
    for (let i = 0; i < this.count; i++) {
      const heart = this.hearts[i];

      // State machine logic
      if (this.isScrolling && (heart.state === 'hidden' || heart.state === 'exiting')) {
        // Randomly spawn hearts while scrolling
        if (Math.random() < 0.15) {
          heart.state = 'entering';
          
          // Spawn in a 3D environment aware radius around the camera's view
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            -2 - Math.random() * 6 // In front of the camera
          );
          offset.applyQuaternion(this.camera.quaternion);
          heart.position.copy(this.camera.position).add(offset);
          
          // Drift slowly upwards and randomly sideways
          heart.velocity.set(
            (Math.random() - 0.5) * 1.5,
            Math.random() * 1.0 + 0.5, 
            (Math.random() - 0.5) * 1.5
          );
          
          heart.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
          heart.rotSpeed.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
          
          heart.animTimer = -heart.delay; // staggered sparkling start
        }
      } else if (!this.isScrolling && (heart.state === 'visible' || heart.state === 'entering')) {
        // Stop scrolling -> zooooop glittering fading outro
        heart.state = 'exiting';
        heart.animTimer = 0;
        
        // Zooooop effect: shoot upwards and spin fast!
        heart.velocity.y += 4.0 + Math.random() * 2.0; 
        heart.velocity.x += (Math.random() - 0.5) * 3.0;
        heart.velocity.z += (Math.random() - 0.5) * 3.0;
        heart.rotSpeed.multiplyScalar(4.0); 
      }

      // Animation calculations
      let currentScale = 0;
      let currentOpacity = 0;

      if (heart.state === 'entering') {
        heart.animTimer += deltaTime;
        if (heart.animTimer > 0) {
          const duration = 0.5; // Sparkling intro
          const progress = Math.min(heart.animTimer / duration, 1.0);
          
          // Springy pop-in
          const easeOutBack = (x) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
          };
          currentScale = heart.baseScale * Math.max(0, easeOutBack(progress));
          currentOpacity = progress;
          
          if (progress >= 1.0) {
            heart.state = 'visible';
            heart.animTimer = 0;
          }
        }
      } else if (heart.state === 'visible') {
        heart.animTimer += deltaTime;
        currentScale = heart.baseScale;
        currentOpacity = 1;
        
        // Auto-recycle hearts during long continuous scrolls so they don't all fly off-screen
        if (heart.animTimer > 2.5 + heart.delay * 5) {
          heart.state = 'exiting';
          heart.animTimer = 0;
          // Apply a gentle version of the zoooop for auto-recycled hearts
          heart.velocity.y += 1.5; 
          heart.rotSpeed.multiplyScalar(2.0); 
        }
      } else if (heart.state === 'exiting') {
        heart.animTimer += deltaTime;
        const duration = 0.6; // Quick zoooop fade
        const progress = Math.min(heart.animTimer / duration, 1.0);
        
        // Shrink and fade
        currentScale = heart.baseScale * (1.0 - progress);
        currentOpacity = 1.0 - Math.pow(progress, 2); // Ease in fade
        
        if (progress >= 1.0) heart.state = 'hidden';
      }

      // Physics and updating instances
      if (heart.state !== 'hidden' && heart.animTimer > 0) {
        heart.position.addScaledVector(heart.velocity, deltaTime);
        heart.rotation.addScaledVector(heart.rotSpeed, deltaTime);

        dummy.position.copy(heart.position);
        dummy.rotation.setFromVector3(heart.rotation);
        
        // Extra glittering scale pulse
        const pulse = 1.0 + 0.15 * Math.sin(time * 25 + i);
        dummy.scale.setScalar(currentScale * pulse);
        
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
        opacities[i] = currentOpacity;
      } else {
        dummy.position.set(0,0,0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
        opacities[i] = 0;
      }
    }
    
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.geometry.attributes.instanceOpacity.needsUpdate = true;
  }
}
