import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHASES } from './phaseConfig.js';
import { math } from '../utils/math.js';

gsap.registerPlugin(ScrollTrigger);

export class ScrollTimeline {
  constructor({ cameraDirector, lightingSystem }) {
    this.cameraDirector = cameraDirector;
    this.lightingSystem = lightingSystem;
    
    // Add other systems here later (particleSystem, textReveal, progressBar)
    this.particleSystem = null;
    this.textReveal = null;
    this.progressBar = null;
  }
  
  init() {
    ScrollTrigger.create({
      trigger: '.scroll-container',
      pin: '.experience-wrapper',
      scrub: 0.6, // SmoothScroll handles the heavy weighting; keep scrub light so final phases stay responsive
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => this.onProgress(self.progress)
    });
  }
  
  setSystems({ particleSystem, textReveal, progressBar, audioSystem, photoReel }) {
    this.particleSystem = particleSystem;
    this.textReveal = textReveal;
    this.progressBar = progressBar;
    this.audioSystem = audioSystem;
    this.photoReel = photoReel;
  }
  
  onProgress(progress) {
    // Determine current phase and local progress
    let currentPhaseIndex = 0;
    let localProgress = 0;
    
    for (let i = 0; i < PHASES.length; i++) {
      const phase = PHASES[i];
      if (progress >= phase.start && progress <= phase.end) {
        currentPhaseIndex = i;
        // Calculate local progress (0 to 1) within the current phase
        localProgress = math.mapRange(progress, phase.start, phase.end, 0, 1);
        break;
      }
      // If we are exactly at the end of the last phase
      if (i === PHASES.length - 1 && progress > phase.end) {
        currentPhaseIndex = i;
        localProgress = 1;
      }
    }
    
    // Dispatch to systems
    if (this.cameraDirector) {
      this.cameraDirector.update(progress, currentPhaseIndex, localProgress);
    }
    
    if (this.lightingSystem) {
      this.lightingSystem.update(progress, currentPhaseIndex, localProgress);
    }
    
    if (this.particleSystem) {
      this.particleSystem.update(progress, currentPhaseIndex, localProgress);
    }
    
    if (this.textReveal) {
      this.textReveal.update(progress, currentPhaseIndex, localProgress);
    }
    
    if (this.progressBar) {
      this.progressBar.update(progress);
    }
    
    if (this.audioSystem) {
      this.audioSystem.update(progress);
    }
    
    if (this.photoReel) {
      this.photoReel.update(progress, currentPhaseIndex, localProgress);
    }
  }
}
