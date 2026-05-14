import './styles/index.css';
import { SceneManager } from './scene/SceneManager.js';
import { ModelLoader } from './scene/ModelLoader.js';
import { LightingSystem } from './scene/LightingSystem.js';
import { CameraDirector } from './camera/CameraDirector.js';
import { ScrollTimeline } from './scroll/ScrollTimeline.js';
import { SmoothScroll } from './scroll/SmoothScroll.js';
import { TextReveal } from './text/TextReveal.js';
import { ParticleSystem } from './scene/ParticleSystem.js';
import { HeartSystem } from './scene/HeartSystem.js';
import { Loader } from './ui/Loader.js';
import { ProgressBar } from './ui/ProgressBar.js';
import { EndScreen } from './ui/EndScreen.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { PhotoReel } from './ui/PhotoReel.js';

console.log('Main.js initialized.');

// Setup UI
const loader = new Loader();
const progressBar = new ProgressBar();
const endScreen = new EndScreen();

// Setup Scene first so we can pass camera to PhotoReel
const canvas = document.getElementById('webgl-canvas');
const sceneManager = new SceneManager(canvas);

const photoReel = new PhotoReel(sceneManager.camera);

// Setup Audio
const audioSystem = new AudioSystem('audio/track1.m4a');

// Setup Model
const modelLoader = new ModelLoader(sceneManager.scene);
// Show placeholder immediately, then load real model
modelLoader.createPlaceholder();
modelLoader.loadModel('models/shreyy_walking.glb').then(() => {
  console.log("Model loaded successfully!");
  
  // Wait for fonts and assets to load
  // Once the model is ready, we let the user click to start
  loader.readyToStart(() => {
    // Force initial state
    scrollTimeline.onProgress(0);
    // Start audio
    audioSystem.start();
  });
}).catch(() => {
  // Even if it fails, let them start with the placeholder
  loader.readyToStart(() => {
    scrollTimeline.onProgress(0);
    audioSystem.start();
  });
});

// Setup Lighting
const lightingSystem = new LightingSystem(sceneManager.scene);
lightingSystem.update(0, 0, 0);

// Setup Particles
const particleSystem = new ParticleSystem(sceneManager.scene);
const heartSystem = new HeartSystem(sceneManager.scene, sceneManager.camera);

// Setup Camera Director
const cameraDirector = new CameraDirector(sceneManager.camera);
cameraDirector.update(0, 0, 0);

// Setup Text Reveal
const textReveal = new TextReveal();

// Setup Scroll Timeline
const scrollTimeline = new ScrollTimeline({
  cameraDirector,
  lightingSystem
});
scrollTimeline.setSystems({ textReveal, particleSystem, progressBar, audioSystem, photoReel });
scrollTimeline.init();

// Smooth, weighted scroll with per-event speed/distance limits.
// Lerp gives the page a sense of heaviness; maxStep prevents fast wheel flicks
// from skipping ahead. Document height is unchanged so all phases (including
// the final ones) still reach 100% scroll progress.
const smoothScroll = new SmoothScroll({
  lerp: 0.07,
  wheelMultiplier: 0.9,
  maxStep: 220,
});
smoothScroll.enable();
window.__smoothScroll = smoothScroll;

// Removed window.addEventListener('load') since we now use the model loaded callback

// Start render loop
sceneManager.startLoop((deltaTime) => {
  particleSystem.tick(sceneManager.clock.getElapsedTime());
  heartSystem.tick(sceneManager.clock.getElapsedTime(), deltaTime, window.scrollY);
  modelLoader.update(deltaTime); // Update animation mixer
  
  // Custom update for EndScreen based on scroll
  const scrollProgress = document.documentElement.scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
  endScreen.update(scrollProgress);
});

