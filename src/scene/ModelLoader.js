import * as THREE from 'three';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // Footstep glow setup
    this.footBones = [];           // detected foot bones { bone, prevY, planted, side }
    this.footstepGlows = [];       // active ground glow instances
    this.shoeGlows = [];           // active shoe-outline glow instances
    this.footstepGroup = new THREE.Group();
    this.scene.add(this.footstepGroup);
    this._glowTexture = this._createGlowTexture();
    this._tmpVec = new THREE.Vector3();
    this._tmpVec2 = new THREE.Vector3();
    this.shoeMeshes = { L: null, R: null }; // shoe/foot meshes by side, found after model load
  }

  _createGlowTexture() {
    // Soft radial gradient -> additive glow disc
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0.0, 'rgba(255, 230, 170, 1.0)');
    grad.addColorStop(0.25, 'rgba(212, 168, 85, 0.7)');
    grad.addColorStop(0.6, 'rgba(180, 130, 60, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _spawnFootstepGlow(worldPos, side) {
    const geo = new THREE.PlaneGeometry(0.9, 0.9);
    const mat = new THREE.MeshBasicMaterial({
      map: this._glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;       // lie flat on ground
    // Sit slightly *below* the ground plane so the glow reads as coming from
    // the floor beneath her, not radiating off her toes.
    mesh.position.set(worldPos.x, -0.05, worldPos.z);
    mesh.renderOrder = -1; // draw before the model so her feet sit on top
    this.footstepGroup.add(mesh);
    mesh.visible = false; // hidden until the delay elapses
    this.footstepGlows.push({
      mesh,
      mat,
      age: 0,
      delay: 0.15,      // seconds to wait after foot plants before glow appears
      life: 0.7,        // seconds before fully faded (after delay)
      peakOpacity: 1.1, // bloom intensity at start
      startScale: 0.55,
      endScale: 1.6,
      side,
      shoeTriggered: false,
    });
  }

  _spawnShoeGlow(side) {
    const shoe = this.shoeMeshes[side];
    if (!shoe || !shoe.material) return;
    // Clone the material so we can tint/emit on just this footstep without
    // permanently altering the model's shared material.
    const origMat = Array.isArray(shoe.material) ? shoe.material[0] : shoe.material;
    if (!origMat || !('emissive' in origMat)) return; // need a Standard/Phong-like mat
    const overlayMat = origMat.clone();
    overlayMat.transparent = true;
    overlayMat.depthWrite = false;
    overlayMat.emissive = new THREE.Color(0xffd28a);
    overlayMat.emissiveIntensity = 0.0;
    overlayMat.opacity = 0.0;
    // Slightly enlarged overlay mesh so the glow reads as a soft outer rim,
    // not a re-skin of the shoe.
    const overlay = new THREE.Mesh(shoe.geometry, overlayMat);
    overlay.scale.copy(shoe.scale).multiplyScalar(1.04);
    // Parent to the shoe so it follows the foot animation exactly.
    shoe.add(overlay);
    overlay.position.set(0, 0, 0);
    overlay.rotation.set(0, 0, 0);
    overlay.scale.setScalar(1.04);
    this.shoeGlows.push({
      mesh: overlay,
      mat: overlayMat,
      parent: shoe,
      age: 0,
      life: 0.55,        // total visible time
      peakEmissive: 1.6, // emissive intensity at peak
      peakOpacity: 0.55, // outer-layer opacity at peak
    });
  }

  _detectFootBones(model) {
    this.footBones = [];
    const candidates = [];
    model.traverse((node) => {
      if (!node.isBone && node.type !== 'Bone') return;
      const name = (node.name || '').toLowerCase();
      // Common rig naming: foot, toe, ankle, ball
      if (name.includes('foot') || name.includes('toe') || name.includes('ankle') || name.includes('ball')) {
        const side = name.includes('left') || name.endsWith('.l') || name.includes('_l_') || name.endsWith('_l')
          ? 'L'
          : (name.includes('right') || name.endsWith('.r') || name.includes('_r_') || name.endsWith('_r') ? 'R' : '?');
        candidates.push({ bone: node, side, name });
      }
    });

    // Prefer one bone per side: pick the lowest-named match (toe > ball > foot > ankle precedence)
    const priority = (n) => {
      n = n.toLowerCase();
      if (n.includes('toe')) return 4;
      if (n.includes('ball')) return 3;
      if (n.includes('foot')) return 2;
      if (n.includes('ankle')) return 1;
      return 0;
    };
    const bySide = { L: null, R: null, '?': [] };
    for (const c of candidates) {
      if (c.side === 'L' || c.side === 'R') {
        if (!bySide[c.side] || priority(c.name) > priority(bySide[c.side].name)) {
          bySide[c.side] = c;
        }
      } else {
        bySide['?'].push(c);
      }
    }
    const chosen = [bySide.L, bySide.R, ...bySide['?']].filter(Boolean).slice(0, 2);
    if (chosen.length === 0) return;
    this.footBones = chosen.map((c) => ({
      bone: c.bone,
      side: c.side,
      prevY: Infinity,
      planted: false,
    }));
    console.log('Footstep glow tracking bones:', this.footBones.map((f) => `${f.side}:${f.bone.name}`));

    // Find shoe/foot skinned meshes by name keywords ('shoe', 'foot', 'boot').
    // Falls back to the lowest-Y mesh per side if naming is generic.
    const meshCandidates = { L: [], R: [] };
    model.traverse((node) => {
      if (!node.isMesh) return;
      const n = (node.name || '').toLowerCase();
      const isShoeish = n.includes('shoe') || n.includes('boot') || n.includes('foot');
      if (!isShoeish) return;
      const side = n.includes('left') || n.endsWith('.l') || n.includes('_l_') || n.endsWith('_l') ? 'L'
                 : n.includes('right') || n.endsWith('.r') || n.includes('_r_') || n.endsWith('_r') ? 'R'
                 : '?';
      if (side === 'L' || side === 'R') meshCandidates[side].push(node);
    });
    if (meshCandidates.L[0]) this.shoeMeshes.L = meshCandidates.L[0];
    if (meshCandidates.R[0]) this.shoeMeshes.R = meshCandidates.R[0];

    // If we couldn't find a named shoe mesh, fall back to a single skinned
    // mesh and reuse it for both feet (shoe overlay won't be side-correct,
    // but at least the effect still runs).
    if (!this.shoeMeshes.L && !this.shoeMeshes.R) {
      let firstSkinned = null;
      model.traverse((n) => { if (!firstSkinned && n.isSkinnedMesh) firstSkinned = n; });
      this.shoeMeshes.L = firstSkinned;
      this.shoeMeshes.R = firstSkinned;
    }
    console.log('Footstep shoe meshes:', { L: this.shoeMeshes.L?.name, R: this.shoeMeshes.R?.name });
  }

  _updateFootsteps(deltaTime) {
    // 1. Detect plant events (foot moves downward and is near ground)
    if (this.footBones.length > 0) {
      // The foot bone world Y relative to the modelGroup's ground (modelGroup is at y=0).
      const LIFT_THRESHOLD = 0.15;   // foot must rise above this before counting next plant
      for (const f of this.footBones) {
        f.bone.getWorldPosition(this._tmpVec);
        const y = this._tmpVec.y;

        // Track the minimum Y reached during this step (the actual touch point).
        if (!f.planted) {
          if (y < (f.minY ?? Infinity)) f.minY = y;
          // A plant happens at the *bottom* of the foot's arc: it was descending,
          // and is now moving back up (or stopped) — fire one frame after the min.
          const wasDescending = f.prevY < (f.prevPrevY ?? Infinity);
          const nowRising = y > f.prevY;
          if (wasDescending && nowRising && f.prevY <= (f.minY + 0.005)) {
            f.planted = true;
            // Spawn at the lowest captured position (use current XZ, ground Y)
            this._spawnFootstepGlow(this._tmpVec, f.side);
          }
        } else if (y > LIFT_THRESHOLD) {
          f.planted = false;
          f.minY = Infinity;
        }
        f.prevPrevY = f.prevY;
        f.prevY = y;
      }
    }

    // 2. Animate existing glows
    for (let i = this.footstepGlows.length - 1; i >= 0; i--) {
      const g = this.footstepGlows[i];
      g.age += deltaTime;
      // Hold invisible until delay has passed
      if (g.age < g.delay) continue;
      g.mesh.visible = true;
      const t = (g.age - g.delay) / g.life;
      // As the ground glow nears its end, hand off to the shoe overlay so the
      // light smoothly travels up onto the outer layer of the shoe.
      if (!g.shoeTriggered && t >= 0.7) {
        g.shoeTriggered = true;
        this._spawnShoeGlow(g.side);
      }
      if (t >= 1) {
        this.footstepGroup.remove(g.mesh);
        g.mesh.geometry.dispose();
        g.mat.dispose();
        this.footstepGlows.splice(i, 1);
        continue;
      }
      // Opacity: quick bloom in, slow fade out
      const fadeIn = Math.min(t / 0.15, 1);
      const fadeOut = 1 - Math.max((t - 0.15) / 0.85, 0);
      g.mat.opacity = g.peakOpacity * fadeIn * fadeOut;
      // Scale: expand outward
      const s = g.startScale + (g.endScale - g.startScale) * t;
      g.mesh.scale.set(s, s, s);
    }

    // Animate shoe-outline glows (parented to the shoe mesh)
    for (let i = this.shoeGlows.length - 1; i >= 0; i--) {
      const s = this.shoeGlows[i];
      s.age += deltaTime;
      const t = s.age / s.life;
      if (t >= 1) {
        if (s.parent) s.parent.remove(s.mesh);
        s.mat.dispose();
        this.shoeGlows.splice(i, 1);
        continue;
      }
      // Smooth bell curve: fade in over first 35%, fade out over remaining 65%.
      const bell = t < 0.35
        ? (t / 0.35)
        : 1 - ((t - 0.35) / 0.65);
      const eased = bell * bell * (3 - 2 * bell); // smoothstep
      s.mat.emissiveIntensity = s.peakEmissive * eased;
      s.mat.opacity = s.peakOpacity * eased;
    }
  }

  createPlaceholder() {
    // Clear any existing children
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }

    // Dark silhouette material
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    });

    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.6, 32);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = 0.8; // Half height

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 1.8;

    // Shoulders
    const shoulderGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const shoulderL = new THREE.Mesh(shoulderGeo, material);
    shoulderL.position.set(-0.35, 1.5, 0);
    const shoulderR = new THREE.Mesh(shoulderGeo, material);
    shoulderR.position.set(0.35, 1.5, 0);

    // Assemble
    this.modelGroup.add(body);
    this.modelGroup.add(head);
    this.modelGroup.add(shoulderL);
    this.modelGroup.add(shoulderR);

    // Position so feet are at y=0
    this.modelGroup.position.set(0, 0, 0);
  }

  async loadModel(url) {
    console.log('Loading real model from:', url);
    return new Promise((resolve, reject) => {
      import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            // Clear placeholder
            while (this.modelGroup.children.length > 0) {
              this.modelGroup.remove(this.modelGroup.children[0]);
            }

            const model = gltf.scene;

            // Adjust scale and position based on the model bounding box
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());

            // Normalize height to 2.0 (same as placeholder)
            const targetHeight = 2.0;
            const scale = targetHeight / size.y;
            model.scale.setScalar(scale);

            // Recompute bounding box after scale
            const box2 = new THREE.Box3().setFromObject(model);
            const center2 = box2.getCenter(new THREE.Vector3());

            // Center horizontally, and put feet exactly at y=0
            model.position.x = -center2.x;
            model.position.z = -center2.z;
            model.position.y = -box2.min.y;

            // Fix materials (optional, depends on model export)
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material.roughness = Math.min(child.material.roughness + 0.2, 1.0); // Slightly rougher for cinematic lighting
                }
              }
            });

            this.modelGroup.add(model);

            // Find foot bones for footstep glow
            this._detectFootBones(model);

            // Setup Animation
            if (gltf.animations && gltf.animations.length > 0) {
              this.mixer = new THREE.AnimationMixer(model);
              const action = this.mixer.clipAction(gltf.animations[0]); // Assuming walking is the first/only animation
              action.timeScale = 0.5;
              action.play();
            }

            resolve();
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error) => {
            console.error('Error loading model:', error);
            console.warn('Falling back to placeholder.');
            this.createPlaceholder();
            reject(error);
          }
        );
      }).catch(err => {
        console.error('Failed to load GLTFLoader module', err);
        this.createPlaceholder();
        reject(err);
      });
    });
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    this._updateFootsteps(deltaTime);
  }

  getModel() {
    return this.modelGroup;
  }

  getHeight() {
    return 2.0; // Approximate height of the placeholder model
  }
}
