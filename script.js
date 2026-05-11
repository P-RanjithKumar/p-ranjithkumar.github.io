/* ===================================================
   ALL THE BEST — Cinematic Script
   Audio-synced dialogue · Real 3D Heart (Three.js r128)
   Mobile-first · iPhone 16/17 Optimized
   =================================================== */

// ─── Detect Mobile ────────────────────────────────
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const DPR = Math.min(window.devicePixelRatio || 1, 2);

// ─── Phase Data ───────────────────────────────────
const PHASES = [
    { time: 0, text: '', type: 'pre', hx: 0, hy: 1.5, cz: 6.5 },
    { time: 6, text: 'Yeh khaas message sirf tumhare liye hai...', type: 'intro', hx: 0, hy: 0.8, cz: 5.5 },
    { time: 31, text: 'Yeh waqt, yeh waqt hai tumhare paas,', type: 'dialog', hx: 0, hy: 1.2, cz: 5.0 },
    { time: 36, text: 'Shayad tumhari zindagi ke sabse khaas yeh waqt.', type: 'dialog', hx: 2.0, hy: 0.8, cz: 5.0 },
    { time: 41, text: 'Aaj tum achcha karo ya bura,\nyeh waqt tumhe zindagi bhar yaad rahega.', type: 'dialog', hx: -2.0, hy: 0.5, cz: 4.8 },
    { time: 48, text: 'Toh kaise karna hai,\naaj main tumhe nahin bataoonga.', type: 'dialog', hx: 0, hy: 0.3, cz: 4.5 },
    { time: 55, text: 'Bas itna kahoonga ke jaao\naur yeh waqt jee bhar kar de do.', type: 'dialog', hx: 1.8, hy: 1.0, cz: 5.0 },
    { time: 68, text: 'Kyun ki iske baad aane waali zindagi mein,\nchahe kuch sahi ho ya na ho,\nchahe kuch rahe ya na rahe,\ntum haaro ya jeeto \u2014', type: 'dialog', hx: -1.2, hy: 0.3, cz: 4.2 },
    { time: 76, text: 'Lekin yeh waqt tumse koi nahin cheen sakta,\nkoi nahin!', type: 'intense', hx: 0, hy: 1.8, cz: 4.0 },
    { time: 84, text: '', type: 'buildup', hx: 0, hy: 2.2, cz: 3.8 },
    { time: 118, text: 'Toh jaao!\nJaao aur apne aap se, is zindagi se,\napne khuda se,', type: 'finale', hx: -1.2, hy: 1.6, cz: 4.2 },
    { time: 124, text: 'aur har us insaan se jisne tumhe,\ntum par bharosa nahin kiya \u2014', type: 'finale', hx: 1.2, hy: 1.6, cz: 4.2 },
    { time: 133, text: 'Apna yeh waqt cheen lo. \uD83D\uDCAB', type: 'finale', hx: 0, hy: 1.5, cz: 3.8 },
    { time: 137, text: '', type: 'end', hx: 0, hy: 0.5, cz: 5.5 }
];

// ─── DOM References ───────────────────────────────
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const sceneEl = document.getElementById('scene');
const dialogText = document.getElementById('dialog-text');
const progressBar = document.getElementById('progress-bar');
const finaleOverlay = document.getElementById('finale-overlay');
const audio = document.getElementById('audio');
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');

// ─── State ────────────────────────────────────────
let currentPhaseIndex = -1;
let particles = [];
let confettiParticles = [];
let animFrameId = null;
let particleIntensity = 1;
let hasStarted = false;  // prevent double-start

// ─── Particle Counts ─────────────────────────────
const PC = {
    start: IS_MOBILE ? 18 : 30,
    init: IS_MOBILE ? 30 : 50,
    intro: IS_MOBILE ? 35 : 60,
    dialog: IS_MOBILE ? 45 : 80,
    intense: IS_MOBILE ? 80 : 150,
    buildup: IS_MOBILE ? 100 : 200,
    finale: IS_MOBILE ? 90 : 180,
    confBurst: IS_MOBILE ? 40 : 80,
    confEnd: IS_MOBILE ? 70 : 150,
    confLoop: IS_MOBILE ? 20 : 40,
};

// ===================================================
// 2D PARTICLE CANVAS SETUP
// ===================================================
function resizePCanvas() {
    var w = window.innerWidth, h = window.innerHeight;
    pCanvas.width = w * DPR;
    pCanvas.height = h * DPR;
    pCanvas.style.width = w + 'px';
    pCanvas.style.height = h + 'px';
    pCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resizePCanvas);
window.addEventListener('orientationchange', function () { setTimeout(resizePCanvas, 200); });
resizePCanvas();

// ===================================================
// PARTICLE SYSTEM
// ===================================================
function createParticle() {
    var w = window.innerWidth, h = window.innerHeight;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * (IS_MOBILE ? 2 : 2.5) + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1) * particleIntensity,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        hue: 40 + Math.random() * 20,
        sat: 80 + Math.random() * 20,
        lit: 55 + Math.random() * 20
    };
}

function updateParticle(p) {
    var w = window.innerWidth, h = window.innerHeight;
    p.y += p.speedY;
    p.x += p.speedX;
    p.opacity += p.fadeDir * 0.003;
    if (p.opacity > 0.7) p.fadeDir = -1;
    if (p.opacity < 0.05) p.fadeDir = 1;
    if (p.y < -10 || p.x < -10 || p.x > w + 10) {
        p.x = Math.random() * w;
        p.y = h + 10;
        p.opacity = 0.05;
        p.fadeDir = 1;
    }
}

function drawParticle(p) {
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    pCtx.fillStyle = 'hsla(' + p.hue + ',' + p.sat + '%,' + p.lit + '%,' + p.opacity + ')';
    pCtx.fill();
    if (p.size > (IS_MOBILE ? 1.8 : 1.5)) {
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        pCtx.fillStyle = 'hsla(' + p.hue + ',' + p.sat + '%,' + p.lit + '%,' + (p.opacity * 0.15) + ')';
        pCtx.fill();
    }
}

function initParticles(n) {
    particles = [];
    for (var i = 0; i < n; i++) particles.push(createParticle());
}

function adjustParticles(n) {
    while (particles.length < n) particles.push(createParticle());
    while (particles.length > n) particles.pop();
}

// ===================================================
// CONFETTI SYSTEM
// ===================================================
function createConfetti() {
    var cols = ['#ffd700', '#ffb347', '#fff3b0', '#ff6b8a', '#ffa07a', '#ffe066'];
    return {
        x: Math.random() * window.innerWidth,
        y: -10,
        size: Math.random() * (IS_MOBILE ? 5 : 6) + 3,
        speedY: Math.random() * 3 + 1.5,
        speedX: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        rotSpd: (Math.random() - 0.5) * 8,
        opacity: 1,
        color: cols[Math.floor(Math.random() * cols.length)]
    };
}

function updateConfetti(c) {
    c.y += c.speedY;
    c.x += c.speedX;
    c.rot += c.rotSpd;
    c.opacity -= 0.003;
    if (c.y > window.innerHeight + 20) c.opacity = 0;
}

function drawConfetti(c) {
    if (c.opacity <= 0) return;
    pCtx.save();
    pCtx.translate(c.x, c.y);
    pCtx.rotate(c.rot * Math.PI / 180);
    pCtx.globalAlpha = c.opacity;
    pCtx.fillStyle = c.color;
    pCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
    pCtx.restore();
    pCtx.globalAlpha = 1;
}

function burstConfetti(n) {
    for (var i = 0; i < n; i++) confettiParticles.push(createConfetti());
}

// ===================================================
// THREE.JS — REAL 3D HEART
// ===================================================
var heartScene, heartCamera, heartRenderer, heartMesh, heartLight;
var threeReady = false;

// ─── Heart Mood Presets ───────────────────────────
var HEART_MOODS = {
    idle: { rotSpeedY: 0.3, rotSpeedX: 0.08, pulseSpeed: 1.0, pulseMin: 0.95, pulseMax: 1.05, emissiveInt: 0.15, floatAmp: 0.15, floatSpeed: 1.0, lightInt: 1.2 },
    intro: { rotSpeedY: 0.4, rotSpeedX: 0.05, pulseSpeed: 0.8, pulseMin: 0.97, pulseMax: 1.04, emissiveInt: 0.25, floatAmp: 0.12, floatSpeed: 0.8, lightInt: 1.4 },
    dialog: { rotSpeedY: 0.5, rotSpeedX: 0.1, pulseSpeed: 1.2, pulseMin: 0.96, pulseMax: 1.07, emissiveInt: 0.3, floatAmp: 0.1, floatSpeed: 1.0, lightInt: 1.6 },
    intense: { rotSpeedY: 1.8, rotSpeedX: 0.4, pulseSpeed: 3.5, pulseMin: 0.88, pulseMax: 1.22, emissiveInt: 0.9, floatAmp: 0.04, floatSpeed: 2.5, lightInt: 2.5 },
    buildup: { rotSpeedY: 3.0, rotSpeedX: 0.6, pulseSpeed: 5.0, pulseMin: 0.82, pulseMax: 1.35, emissiveInt: 1.4, floatAmp: 0.02, floatSpeed: 3.5, lightInt: 3.5 },
    finale: { rotSpeedY: 0.9, rotSpeedX: 0.25, pulseSpeed: 2.0, pulseMin: 0.9, pulseMax: 1.18, emissiveInt: 1.8, floatAmp: 0.18, floatSpeed: 0.6, lightInt: 4.0 },
    end: { rotSpeedY: 0.2, rotSpeedX: 0.04, pulseSpeed: 0.6, pulseMin: 0.98, pulseMax: 1.02, emissiveInt: 0.6, floatAmp: 0.2, floatSpeed: 0.4, lightInt: 2.0 }
};

var heartMoodCurrent = {
    rotSpeedY: 0.3, rotSpeedX: 0.08, pulseSpeed: 1.0, pulseMin: 0.95, pulseMax: 1.05,
    emissiveInt: 0.15, floatAmp: 0.15, floatSpeed: 1.0, lightInt: 1.2
};
var heartMoodTarget = HEART_MOODS.idle;

function lerpMood(dt) {
    var t = 1 - Math.pow(0.05, dt); // smooth exponential lerp
    for (var key in heartMoodTarget) {
        heartMoodCurrent[key] += (heartMoodTarget[key] - heartMoodCurrent[key]) * t;
    }
}

function setHeartMood(name) {
    if (HEART_MOODS[name]) heartMoodTarget = HEART_MOODS[name];
}

// ─── Heart Position (lerped per-phase) ───────────
var heartTargetX = 0, heartTargetY = 1.5, heartTargetCamZ = 6.5;
var heartCurrentX = 0, heartCurrentY = 1.5, heartCurrentCamZ = 6.5;

function setHeartPos(phase) {
    if (phase.hx !== undefined) heartTargetX = phase.hx;
    if (phase.hy !== undefined) heartTargetY = phase.hy;
    if (phase.cz !== undefined) heartTargetCamZ = phase.cz;
}

// ─── Three.js Setup ──────────────────────────────
function initThreeHeart() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded — skipping 3D heart');
        return;
    }

    try {
        var heartCanvas = document.getElementById('heart-canvas');

        heartScene = new THREE.Scene();

        heartCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        heartCamera.position.set(0, 0.3, 5.5);
        heartCamera.lookAt(0, 0, 0);

        heartRenderer = new THREE.WebGLRenderer({
            canvas: heartCanvas,
            antialias: true,
            alpha: true
        });
        heartRenderer.setPixelRatio(DPR);
        heartRenderer.setClearColor(0x000000, 0);
        // r128 uses outputEncoding (not outputColorSpace)
        if (heartRenderer.outputEncoding !== undefined) {
            heartRenderer.outputEncoding = THREE.sRGBEncoding;
        }

        // Size the renderer to match the CSS canvas size
        var rect = heartCanvas.getBoundingClientRect();
        heartRenderer.setSize(rect.width, rect.height);
        heartCamera.aspect = rect.width / rect.height;
        heartCamera.updateProjectionMatrix();

        // ─── Heart Shape (2D bezier path) ───
        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0, 0.45, -0.55, 1.05, -1.1, 1.05);
        shape.bezierCurveTo(-1.7, 1.05, -1.7, 0.35, -1.7, 0.35);
        shape.bezierCurveTo(-1.7, -0.25, -1.05, -0.9, 0, -1.7);
        shape.bezierCurveTo(1.05, -0.9, 1.7, -0.25, 1.7, 0.35);
        shape.bezierCurveTo(1.7, 0.35, 1.7, 1.05, 1.1, 1.05);
        shape.bezierCurveTo(0.55, 1.05, 0, 0.45, 0, 0);

        // ─── Extrude into 3D ───
        var extrudeSettings = {
            depth: 0.6,
            bevelEnabled: true,
            bevelSegments: IS_MOBILE ? 4 : 6,
            bevelSize: 0.18,
            bevelThickness: 0.18,
            curveSegments: IS_MOBILE ? 16 : 24
        };
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        // ─── Golden material ───
        var material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0xffa500,
            emissiveIntensity: 0.15
        });

        heartMesh = new THREE.Mesh(geometry, material);
        heartScene.add(heartMesh);

        // ─── Lighting ───
        var ambient = new THREE.AmbientLight(0xffeedd, 0.5);
        heartScene.add(ambient);

        heartLight = new THREE.PointLight(0xffd700, 1.2, 12);
        heartLight.position.set(2, 2, 4);
        heartScene.add(heartLight);

        var rimLight = new THREE.PointLight(0xff8c00, 0.6, 10);
        rimLight.position.set(-3, -1, 3);
        heartScene.add(rimLight);

        var fillLight = new THREE.PointLight(0xffe4b5, 0.4, 8);
        fillLight.position.set(0, -3, 2);
        heartScene.add(fillLight);

        threeReady = true;
        console.log('Three.js 3D heart initialized successfully');

    } catch (err) {
        console.error('Three.js heart init failed:', err);
        threeReady = false;
    }
}

function resizeHeartRenderer() {
    if (!threeReady || !heartRenderer) return;
    try {
        var heartCanvas = document.getElementById('heart-canvas');
        var rect = heartCanvas.getBoundingClientRect();
        heartRenderer.setSize(rect.width, rect.height);
        heartCamera.aspect = rect.width / rect.height;
        heartCamera.updateProjectionMatrix();
    } catch (e) { /* ignore resize errors */ }
}

window.addEventListener('resize', resizeHeartRenderer);
window.addEventListener('orientationchange', function () { setTimeout(resizeHeartRenderer, 200); });

// ─── Heart Animation ────────────────────────────
var heartClock = 0;

function animateHeart(dt) {
    if (!threeReady || !heartMesh) return;

    heartClock += dt;
    lerpMood(dt);

    // Smooth position lerp (exponential for cinematic feel)
    var posLerp = 1 - Math.pow(0.03, dt);
    heartCurrentX += (heartTargetX - heartCurrentX) * posLerp;
    heartCurrentY += (heartTargetY - heartCurrentY) * posLerp;
    heartCurrentCamZ += (heartTargetCamZ - heartCurrentCamZ) * posLerp;

    // Move the heart mesh in 3D space
    heartMesh.position.x = heartCurrentX;
    // Float bob layered ON TOP of the target Y position
    heartMesh.position.y = heartCurrentY + Math.sin(heartClock * heartMoodCurrent.floatSpeed) * heartMoodCurrent.floatAmp;

    // Move camera closer/further for dramatic size changes
    heartCamera.position.z = heartCurrentCamZ;

    // Rotation
    heartMesh.rotation.y += heartMoodCurrent.rotSpeedY * dt;
    heartMesh.rotation.x = Math.sin(heartClock * 0.5) * heartMoodCurrent.rotSpeedX;

    // Pulse (scale)
    var pulseT = Math.sin(heartClock * heartMoodCurrent.pulseSpeed) * 0.5 + 0.5;
    var s = heartMoodCurrent.pulseMin + pulseT * (heartMoodCurrent.pulseMax - heartMoodCurrent.pulseMin);
    heartMesh.scale.set(s, s, s);

    // Emissive glow
    heartMesh.material.emissiveIntensity = heartMoodCurrent.emissiveInt;

    // Light intensity follows the heart
    if (heartLight) {
        heartLight.intensity = heartMoodCurrent.lightInt;
        heartLight.position.x = heartCurrentX + 2;
        heartLight.position.y = heartCurrentY + 2;
    }

    // Z-index toggle: heart in front of text when camera is close
    var hCanvas = document.getElementById('heart-canvas');
    if (heartCurrentCamZ < 4.0) {
        hCanvas.classList.add('in-front');
    } else {
        hCanvas.classList.remove('in-front');
    }

    // Render
    heartRenderer.render(heartScene, heartCamera);
}

// ===================================================
// PHASE MANAGEMENT
// ===================================================
function getCurrentPhaseIndex(time) {
    var idx = 0;
    for (var i = PHASES.length - 1; i >= 0; i--) {
        if (time >= PHASES[i].time) { idx = i; break; }
    }
    return idx;
}

function transitionToPhase(index) {
    if (index === currentPhaseIndex) return;
    currentPhaseIndex = index;
    var phase = PHASES[index];

    dialogText.classList.remove('visible', 'exit', 'intro-text', 'intense-text', 'finale-text');
    dialogText.classList.add('exit');

    setTimeout(function () {
        dialogText.classList.remove('exit');
        dialogText.textContent = phase.text;

        // Set heart position target for this phase
        setHeartPos(phase);

        switch (phase.type) {
            case 'pre':
                setHeartMood('idle');
                break;
            case 'intro':
                dialogText.classList.add('intro-text');
                if (phase.text) dialogText.classList.add('visible');
                particleIntensity = 0.8;
                adjustParticles(PC.intro);
                setHeartMood('intro');
                break;
            case 'dialog':
                if (phase.text) dialogText.classList.add('visible');
                particleIntensity = 1;
                adjustParticles(PC.dialog);
                setHeartMood('dialog');
                break;
            case 'intense':
                dialogText.classList.add('intense-text');
                if (phase.text) dialogText.classList.add('visible');
                particleIntensity = 2;
                adjustParticles(PC.intense);
                setHeartMood('intense');
                if (navigator.vibrate) navigator.vibrate(100);
                break;
            case 'buildup':
                particleIntensity = 2.5;
                adjustParticles(PC.buildup);
                setHeartMood('buildup');
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                break;
            case 'finale':
                dialogText.classList.add('finale-text');
                if (phase.text) dialogText.classList.add('visible');
                particleIntensity = 2;
                adjustParticles(PC.finale);
                burstConfetti(PC.confBurst);
                setHeartMood('finale');
                if (navigator.vibrate) navigator.vibrate([50, 30, 80, 30, 120]);
                break;
            case 'end':
                dialogText.classList.remove('visible');
                setHeartMood('end');
                showFinale();
                break;
        }
    }, 500);
}

// ===================================================
// FINALE
// ===================================================
function showFinale() {
    finaleOverlay.classList.add('visible');
    burstConfetti(PC.confEnd);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    var iv = setInterval(function () { burstConfetti(PC.confLoop); }, 1500);
    setTimeout(function () { clearInterval(iv); }, 15000);
}

// ===================================================
// AUDIO SYNC
// ===================================================
audio.addEventListener('timeupdate', function () {
    var t = audio.currentTime;
    if (audio.duration) {
        progressBar.style.width = (t / audio.duration * 100) + '%';
    }
    transitionToPhase(getCurrentPhaseIndex(t));
});

audio.addEventListener('ended', function () {
    progressBar.style.width = '100%';
    if (currentPhaseIndex < PHASES.length - 1) {
        transitionToPhase(PHASES.length - 1);
    }
});

// ===================================================
// MAIN ANIMATION LOOP
// ===================================================
var lastTime = 0;

function mainLoop(timestamp) {
    var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    // 2D particles + confetti
    pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (var i = 0; i < particles.length; i++) {
        updateParticle(particles[i]);
        drawParticle(particles[i]);
    }

    for (var j = confettiParticles.length - 1; j >= 0; j--) {
        updateConfetti(confettiParticles[j]);
        drawConfetti(confettiParticles[j]);
        if (confettiParticles[j].opacity <= 0) confettiParticles.splice(j, 1);
    }

    // 3D Heart (only if Three.js loaded)
    animateHeart(dt);

    animFrameId = requestAnimationFrame(mainLoop);
}

// ===================================================
// START
// ===================================================
function handleStart() {
    if (hasStarted) return; // prevent double-trigger
    hasStarted = true;

    console.log('Starting experience...');

    // Hide overlay, show scene
    startOverlay.classList.add('hidden');
    sceneEl.classList.add('active');

    // Stop ambient loop
    if (animFrameId) cancelAnimationFrame(animFrameId);

    // Init Three.js 3D heart
    initThreeHeart();

    // Init particles
    initParticles(PC.init);

    // Start main loop
    lastTime = performance.now();
    requestAnimationFrame(mainLoop);

    // Play audio
    audio.play().then(function () {
        console.log('Audio playing');
    }).catch(function (err) {
        console.warn('Audio play failed:', err);
    });

    // Keep screen awake
    requestWakeLock();
}

startBtn.addEventListener('click', handleStart);

// ===================================================
// iOS QUIRKS
// ===================================================
document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false });

var lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);

// ===================================================
// WAKE LOCK
// ===================================================
function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').catch(function () { });
        }
    } catch (e) { /* not available */ }
}

// ===================================================
// AMBIENT PARTICLES ON START SCREEN
// ===================================================
initParticles(PC.start);

function ambientLoop(timestamp) {
    pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < particles.length; i++) {
        updateParticle(particles[i]);
        drawParticle(particles[i]);
    }
    animFrameId = requestAnimationFrame(ambientLoop);
}
ambientLoop(performance.now());

console.log('Script loaded. THREE available:', typeof THREE !== 'undefined');
