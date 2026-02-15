// ===== SETUP =====
const canvas = document.getElementById('heartCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.localClippingEnabled = true;

// ===== HEART GEOMETRY =====
const hs = new THREE.Shape();
hs.moveTo(0, 0.5);
hs.bezierCurveTo(0, 0.5, -0.5, 0, -2.5, 0);
hs.bezierCurveTo(-5.5, 0, -5.5, 3.5, -5.5, 3.5);
hs.bezierCurveTo(-5.5, 5.5, -3.5, 7.7, 0, 9.5);
hs.bezierCurveTo(3.5, 7.7, 5.5, 5.5, 5.5, 3.5);
hs.bezierCurveTo(5.5, 3.5, 5.5, 0, 2.5, 0);
hs.bezierCurveTo(0.5, 0, 0, 0.5, 0, 0.5);

const heartGeo = new THREE.ExtrudeGeometry(hs, {
    depth: 3, bevelEnabled: true, bevelSegments: 24,
    steps: 4, bevelSize: 1.2, bevelThickness: 1.0, curveSegments: 48
});
heartGeo.center();
heartGeo.computeVertexNormals();

// ===== TWO-HALF HEART =====
const leftClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.01);
const rightClip = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.01);
const mc = { color: 0xff4466, emissive: 0x330011, roughness: 0.25, metalness: 0.7, transparent: true, opacity: 1, side: THREE.DoubleSide };
const leftMat = new THREE.MeshStandardMaterial({ ...mc, clippingPlanes: [leftClip] });
const rightMat = new THREE.MeshStandardMaterial({ ...mc, clippingPlanes: [rightClip] });

const heartGroup = new THREE.Group();

// Pivot groups: origin at the heart's tip (bottom) so top opens first
// After center(), heart spans ~y=-4.75 (tip) to y=+4.75 (bumps)
// Pivot at tip (y=-4.75), mesh offset so tip sits at pivot origin
const PIVOT_Y = 4.75;

const leftPivot = new THREE.Group();
const leftHalf = new THREE.Mesh(heartGeo, leftMat);
leftHalf.position.y = -PIVOT_Y; // offset mesh up so tip = pivot origin
leftPivot.position.y = PIVOT_Y;  // place pivot at tip location
leftPivot.add(leftHalf);

const rightPivot = new THREE.Group();
const rightHalf = new THREE.Mesh(heartGeo, rightMat);
rightHalf.position.y = -PIVOT_Y;
rightPivot.position.y = PIVOT_Y;
rightPivot.add(rightHalf);

heartGroup.add(leftPivot);
heartGroup.add(rightPivot);
heartGroup.scale.set(0.2, 0.2, 0.2);
heartGroup.rotation.z = Math.PI; // flip right-side up
scene.add(heartGroup);

// ===== DEBRIS =====
const pieces = [];
for (let i = 0; i < 10; i++) {
    const pg = new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.12, 1);
    const pm = new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x110005, roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0 });
    const p = new THREE.Mesh(pg, pm);
    p.userData.dir = new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
    p.userData.rot = new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    heartGroup.add(p);
    pieces.push(p);
}

// ===== LIGHTS =====
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const keyLight = new THREE.PointLight(0xff6688, 2.5, 80); keyLight.position.set(5, 5, 8); scene.add(keyLight);
const fillLight = new THREE.PointLight(0xff88cc, 1.5, 80); fillLight.position.set(-5, -3, 5); scene.add(fillLight);
const backLight = new THREE.PointLight(0x4444ff, 1, 80); backLight.position.set(0, 3, -10); scene.add(backLight);
const goldLight = new THREE.PointLight(0xffd700, 0, 80); goldLight.position.set(0, 0, 10); scene.add(goldLight);

// ===== FLOATING MINI HEARTS (parallax) =====
const miniHeartShape = new THREE.Shape();
miniHeartShape.moveTo(0, 0.5);
miniHeartShape.bezierCurveTo(0, 0.5, -0.5, 0, -2.5, 0);
miniHeartShape.bezierCurveTo(-5.5, 0, -5.5, 3.5, -5.5, 3.5);
miniHeartShape.bezierCurveTo(-5.5, 5.5, -3.5, 7.7, 0, 9.5);
miniHeartShape.bezierCurveTo(3.5, 7.7, 5.5, 5.5, 5.5, 3.5);
miniHeartShape.bezierCurveTo(5.5, 3.5, 5.5, 0, 2.5, 0);
miniHeartShape.bezierCurveTo(0.5, 0, 0, 0.5, 0, 0.5);
const miniGeo = new THREE.ExtrudeGeometry(miniHeartShape, {
    depth: 1.5, bevelEnabled: true, bevelSegments: 6,
    bevelSize: 0.6, bevelThickness: 0.4, curveSegments: 16
});
miniGeo.center();

const pinkShades = [0xff6b8a, 0xff8fab, 0xffb3c6];
const floatingHearts = [];
for (let i = 0; i < 18; i++) {
    const shade = pinkShades[i % 3];
    const mat = new THREE.MeshStandardMaterial({
        color: shade, emissive: shade, emissiveIntensity: 0.15,
        roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.5 + Math.random() * 0.3
    });
    const m = new THREE.Mesh(miniGeo, mat);
    const scale = 0.01 + Math.random() * 0.025;
    m.scale.set(scale, scale, scale);
    m.rotation.z = Math.PI; // right-side up
    m.rotation.y = Math.random() * Math.PI * 2;
    // Scatter in a wide sphere around the main heart
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 12;
    const yPos = (Math.random() - 0.5) * 10;
    m.position.set(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius);
    m.userData = {
        speed: 0.15 + Math.random() * 0.4,
        orbitR: radius,
        angle: angle,
        bobSpeed: 0.3 + Math.random() * 0.5,
        bobAmp: 0.2 + Math.random() * 0.5,
        baseY: yPos,
        spinSpeed: 0.2 + Math.random() * 0.6
    };
    scene.add(m);
    floatingHearts.push(m);
}

// ===== CAMERA STATE =====
// camTarget = where the camera IS. lookOffset = shifts what it looks at, making heart appear left/right.
const camTarget = { x: 0, y: -12, z: 0.5 };
const lookOffset = { x: 0, y: 0 };
camera.position.set(0, -12, 0.5);

// ===== SCROLL SETUP =====
const mainEl = document.getElementById('scrollContainer');
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({ scroller: mainEl });

// ============================================================
//  PHASE CAMERA CHOREOGRAPHY
//  Each phase defines: camera position, heart transform,
//  lookOffset (negative = heart appears RIGHT, positive = LEFT),
//  and lighting changes.
// ============================================================

// Phase1 → Phase2: Bird's-eye swoops to front-left (heart moves LEFT)
gsap.timeline({ scrollTrigger: { trigger: '#phase2', start: 'top bottom', end: 'top 20%', scrub: 2.5 } })
    .to(camTarget, { x: 3, y: -1, z: 7, ease: 'none' }, 0)
    .to(lookOffset, { x: 3, ease: 'none' }, 0) // heart appears LEFT
    .to(heartGroup.scale, { x: 0.3, y: 0.3, z: 0.3, ease: 'none' }, 0)
    .to(heartGroup.rotation, { y: 0.5, x: 0.1, ease: 'none' }, 0)
    .to(keyLight, { intensity: 3 }, 0);

// Phase2 → Phase3: Camera swings to other side (heart moves RIGHT)
gsap.timeline({ scrollTrigger: { trigger: '#phase3', start: 'top bottom', end: 'top 20%', scrub: 2.5 } })
    .to(camTarget, { x: -4, y: -2, z: 6, ease: 'none' }, 0)
    .to(lookOffset, { x: -3.5, ease: 'none' }, 0) // heart appears RIGHT
    .to(heartGroup.rotation, { y: -0.7, x: -0.1, ease: 'none' }, 0)
    .to(heartGroup.scale, { x: 0.38, y: 0.38, z: 0.38, ease: 'none' }, 0)
    .to(keyLight, { intensity: 3.5 }, 0)
    .to(fillLight, { intensity: 2 }, 0);

// Phase3 → Phase4: HEARTBREAK — pivot rotation creates top-first crack!
// Left pivot rotates so left bump swings left; right bump swings right.
// Bottom tip (pivot point) barely moves — crack opens top-down.
gsap.timeline({ scrollTrigger: { trigger: '#phase4', start: 'top bottom', end: 'top 20%', scrub: 2.5 } })
    .to(camTarget, { x: 0, y: 0, z: 12, ease: 'none' }, 0)
    .to(lookOffset, { x: 0, ease: 'none' }, 0)
    .to(heartGroup.scale, { x: 0.28, y: 0.28, z: 0.28, ease: 'none' }, 0)
    .to(heartGroup.rotation, { y: 0, x: 0, z: Math.PI, ease: 'none' }, 0)
    // Pivot rotations — top opens first, bottom is the hinge
    .to(leftPivot.rotation, { z: -0.4, ease: 'power2.out' }, 0)
    .to(rightPivot.rotation, { z: 0.4, ease: 'power2.out' }, 0)
    // Slight outward drift for dramatic effect
    .to(leftPivot.position, { x: -0.8, ease: 'power2.out' }, 0)
    .to(rightPivot.position, { x: 0.8, ease: 'power2.out' }, 0)
    // Fade to grey
    .to(leftMat, { opacity: 0.45 }, 0).to(rightMat, { opacity: 0.45 }, 0)
    .to(leftMat.color, { r: 0.35, g: 0.35, b: 0.35 }, 0)
    .to(rightMat.color, { r: 0.35, g: 0.35, b: 0.35 }, 0)
    .to(leftMat.emissive, { r: 0.03, g: 0.03, b: 0.03 }, 0)
    .to(rightMat.emissive, { r: 0.03, g: 0.03, b: 0.03 }, 0)
    .to(keyLight, { intensity: 0.4 }, 0)
    .to(fillLight, { intensity: 0.3 }, 0)
    .to(backLight, { intensity: 0.2 }, 0);

// Debris scatter during phase4
pieces.forEach(p => {
    gsap.timeline({ scrollTrigger: { trigger: '#phase4', start: 'top 60%', end: 'top 10%', scrub: 2 } })
        .to(p.material, { opacity: 0.5 }, 0)
        .to(p.position, { x: p.userData.dir.x, y: p.userData.dir.y, z: p.userData.dir.z, ease: 'power2.out' }, 0)
        .to(p.rotation, { x: p.userData.rot.x, y: p.userData.rot.y, z: p.userData.rot.z }, 0);
});

// Phase4 → Phase5: HEALING — pivots close back, golden glow, heart LEFT
gsap.timeline({ scrollTrigger: { trigger: '#phase5', start: 'top bottom', end: 'top 20%', scrub: 2.5 } })
    .to(camTarget, { x: 3, y: -2, z: 7, ease: 'none' }, 0)
    .to(lookOffset, { x: 3, ease: 'none' }, 0)
    .to(heartGroup.scale, { x: 0.35, y: 0.35, z: 0.35, ease: 'none' }, 0)
    .to(heartGroup.rotation, { y: 0.4, x: 0.05, z: Math.PI, ease: 'none' }, 0)
    // Pivots close — halves rejoin
    .to(leftPivot.rotation, { z: 0, ease: 'power2.inOut' }, 0)
    .to(rightPivot.rotation, { z: 0, ease: 'power2.inOut' }, 0)
    .to(leftPivot.position, { x: 0, ease: 'power2.inOut' }, 0)
    .to(rightPivot.position, { x: 0, ease: 'power2.inOut' }, 0)
    // Golden glow
    .to(leftMat, { opacity: 1 }, 0).to(rightMat, { opacity: 1 }, 0)
    .to(leftMat.color, { r: 1, g: 0.84, b: 0 }, 0)
    .to(rightMat.color, { r: 1, g: 0.84, b: 0 }, 0)
    .to(leftMat.emissive, { r: 0.4, g: 0.25, b: 0 }, 0)
    .to(rightMat.emissive, { r: 0.4, g: 0.25, b: 0 }, 0)
    .to(goldLight, { intensity: 5 }, 0)
    .to(keyLight, { intensity: 2.5 }, 0)
    .to(fillLight, { intensity: 2 }, 0)
    .to(backLight, { intensity: 1 }, 0);

// Debris returns
pieces.forEach(p => {
    gsap.timeline({ scrollTrigger: { trigger: '#phase5', start: 'top bottom', end: 'top 40%', scrub: 2 } })
        .to(p.position, { x: 0, y: 0, z: 0, ease: 'power2.inOut' }, 0)
        .to(p.material, { opacity: 0 }, 0);
});

// Phase5 → Phase6: PROPOSAL — centered, biggest, red
gsap.timeline({ scrollTrigger: { trigger: '#phase6', start: 'top bottom', end: 'top 20%', scrub: 2.5 } })
    .to(camTarget, { x: 0, y: -1, z: 8, ease: 'none' }, 0)
    .to(lookOffset, { x: 0, ease: 'none' }, 0) // CENTER
    .to(heartGroup.scale, { x: 0.42, y: 0.42, z: 0.42, ease: 'none' }, 0)
    .to(heartGroup.rotation, { x: 0, y: 0, z: Math.PI, ease: 'none' }, 0)
    .to(leftMat.color, { r: 1, g: 0.27, b: 0.4 }, 0)
    .to(rightMat.color, { r: 1, g: 0.27, b: 0.4 }, 0)
    .to(leftMat.emissive, { r: 0.45, g: 0.05, b: 0.1 }, 0)
    .to(rightMat.emissive, { r: 0.45, g: 0.05, b: 0.1 }, 0)
    .to(goldLight, { intensity: 0 }, 0)
    .to(keyLight, { intensity: 3 }, 0);

// ===== TEXT REVEALS =====
document.querySelectorAll('.text-panel').forEach(panel => {
    ScrollTrigger.create({
        trigger: panel, start: 'top 85%', scroller: mainEl,
        onEnter: () => panel.classList.add('visible'),
    });
});

// ===== PHASE DOTS =====
const phases = document.querySelectorAll('.phase');
const dotsContainer = document.getElementById('phaseDots');
phases.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('phase-dot');
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('.phase-dot');

function updateDots(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

// ===== RENDER LOOP =====
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth camera lerp (slow = buttery)
    camera.position.x += (camTarget.x - camera.position.x) * 0.035;
    camera.position.y += (camTarget.y - camera.position.y) * 0.035;
    camera.position.z += (camTarget.z - camera.position.z) * 0.035;

    // Gentle float
    heartGroup.position.y = Math.sin(elapsed * 0.4) * 0.06;

    // Animate floating mini hearts
    floatingHearts.forEach(h => {
        const d = h.userData;
        d.angle += d.speed * 0.003;
        h.position.x = Math.cos(d.angle) * d.orbitR;
        h.position.z = Math.sin(d.angle) * d.orbitR;
        h.position.y = d.baseY + Math.sin(elapsed * d.bobSpeed) * d.bobAmp;
        h.rotation.y += d.spinSpeed * 0.008;
    });

    // Clip planes follow each mesh's world transform
    // so each half always shows only its correct side
    const _p = new THREE.Vector3();
    const _q = new THREE.Quaternion();

    leftHalf.getWorldPosition(_p);
    leftHalf.getWorldQuaternion(_q);
    leftClip.normal.set(-1, 0, 0).applyQuaternion(_q);
    leftClip.constant = -_p.dot(leftClip.normal) + 0.005;

    rightHalf.getWorldPosition(_p);
    rightHalf.getWorldQuaternion(_q);
    rightClip.normal.set(1, 0, 0).applyQuaternion(_q);
    rightClip.constant = -_p.dot(rightClip.normal) + 0.005;

    // Camera looks at heart + offset (offsets heart to left/right of screen)
    camera.lookAt(
        heartGroup.position.x + lookOffset.x,
        heartGroup.position.y + lookOffset.y,
        heartGroup.position.z
    );

    renderer.render(scene, camera);
}
animate();

// ===== RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

// ===== NAVIGATION =====
let currentIdx = 0;
const totalPhases = phases.length;

function advancePhase() {
    // Start music on first interaction (guaranteed user gesture)
    if (!isPlaying && !musicStarted) {
        musicStarted = true;
        bgMusic.play().then(() => fadeInMusic()).catch(() => { });
    }
    if (currentIdx < totalPhases - 1) {
        currentIdx++;
        const target = phases[currentIdx].offsetTop;
        gsap.to(mainEl, {
            scrollTop: target,
            duration: 1.8,
            ease: 'power2.inOut'
        });
        updateDots(currentIdx);
    }
    if (currentIdx >= totalPhases - 1) {
        document.getElementById('navPrompt').style.opacity = '0';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); advancePhase(); }
});
mainEl.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    advancePhase();
});
mainEl.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

// ===== CURSOR TILT =====
document.querySelectorAll('.text-panel').forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        if (!panel.classList.contains('visible')) return;
        const r = panel.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        panel.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg)`;
    });
    panel.addEventListener('mouseleave', () => { panel.style.transform = ''; });
});

// ===== MUSIC =====
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const MAX_VOL = 0.15;
bgMusic.volume = 0;
let isPlaying = false;

function fadeInMusic() {
    bgMusic.volume = 0;
    isPlaying = true;
    musicBtn.innerText = '⏸';
    musicBtn.classList.add('playing');
    const fade = setInterval(() => {
        if (bgMusic.volume < MAX_VOL - 0.01) {
            bgMusic.volume = Math.min(bgMusic.volume + 0.003, MAX_VOL);
        } else {
            bgMusic.volume = MAX_VOL;
            clearInterval(fade);
        }
    }, 50); // ~3s fade-in
}

let musicStarted = false;

// Try autoplay immediately (works in some browsers)
bgMusic.play().then(() => {
    musicStarted = true;
    fadeInMusic();
}).catch(() => {
    // Will start on first Space/click via advancePhase()
});

musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isPlaying) {
        bgMusic.play().then(() => {
            bgMusic.volume = MAX_VOL;
            musicBtn.innerText = '⏸';
            musicBtn.classList.add('playing');
            isPlaying = true;
        }).catch(() => { });
    } else {
        bgMusic.pause();
        musicBtn.innerText = '🎵';
        musicBtn.classList.remove('playing');
        isPlaying = false;
    }
});

// ===== PROPOSAL =====
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const successOverlay = document.getElementById('successOverlay');
const noTexts = ["Are you sure?", "Really sure?", "Think again!", "Last chance!", "Surely not?", "You might regret this!", "Have a heart!", "Don't be so cold!", "Change of heart?", "You're breaking my heart 💔", "Plsss? 🥺", "I'm gonna cry 😭", "NOOOOO 😩"];
let noCount = 0;

function moveNoBtn(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const panel = document.querySelector('.proposal-panel');
    const r = panel.getBoundingClientRect();
    const mx = r.width - noBtn.offsetWidth - 20;
    const my = r.height - noBtn.offsetHeight - 20;
    noBtn.style.transform = `translate(${Math.random() * mx - mx / 2}px,${Math.random() * my - my / 2}px) rotate(${Math.random() * 30 - 15}deg)`;
    noBtn.innerText = noTexts[Math.floor(Math.random() * noTexts.length)];
    noCount++;
    yesBtn.style.transform = `scale(${1 + noCount * 0.15})`;
}
noBtn.addEventListener('mouseover', moveNoBtn);
noBtn.addEventListener('touchstart', moveNoBtn);

yesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    successOverlay.classList.remove('hidden');
    const dur = 15000, end = Date.now() + dur;
    const def = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 999 };
    const iv = setInterval(() => {
        const left = end - Date.now();
        if (left <= 0) return clearInterval(iv);
        confetti({ ...def, particleCount: 60 * (left / dur), origin: { x: Math.random(), y: Math.random() * 0.6 } });
    }, 200);
});

// ===== PARTICLES =====
const pc = document.getElementById('particles');
for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (5 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 2) + 'px';
    pc.appendChild(p);
}
