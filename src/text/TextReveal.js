import { gsap } from 'gsap';
import { PHASE_TEXTS } from './phaseTexts.js';

export class TextReveal {
  constructor() {
    this.phaseOverlays = document.querySelectorAll('.phase-overlay');
    this.currentPhaseIndex = -1;
    this.animations = [];
    
    // Initialize text content into the DOM
    this.initTextContent();
  }
  
  initTextContent() {
    this.phaseOverlays.forEach(overlay => {
      const phaseId = overlay.dataset.phase;
      const textData = PHASE_TEXTS[phaseId];
      if (!textData) return;
      
      const mainEl = overlay.querySelector('.text-main');
      const subEl = overlay.querySelector('.text-sub');
      const quoteEl = overlay.querySelector('.text-quote');
      
      if (mainEl && textData.main) mainEl.textContent = textData.main;
      if (subEl && textData.sub) subEl.textContent = textData.sub;
      
      if (quoteEl) {
        if (textData.quote) {
          quoteEl.textContent = textData.quote;
        } else {
          quoteEl.style.display = 'none';
        }
      }
      
      // Hide all initially
      gsap.set([mainEl, subEl, quoteEl], { opacity: 0, y: 30 });
    });
  }
  
  update(scrollProgress, currentPhaseIndex, localProgress) {
    // If phase changed
    if (this.currentPhaseIndex !== currentPhaseIndex) {
      
      // Force hide any overlay that is neither the new one nor the one we're leaving
      this.phaseOverlays.forEach((overlay, idx) => {
        if (idx !== currentPhaseIndex && idx !== this.currentPhaseIndex) {
          const els = overlay.querySelectorAll('.text-main, .text-sub, .text-quote');
          gsap.killTweensOf(els);
          gsap.set(els, { opacity: 0, y: 30 });
        }
      });

      // Animate out previous
      if (this.currentPhaseIndex >= 0) {
        this.animateOut(this.phaseOverlays[this.currentPhaseIndex]);
      }
      
      // Animate in new
      this.currentPhaseIndex = currentPhaseIndex;
      this.animateIn(this.phaseOverlays[currentPhaseIndex]);
    }
    
    // Manage opacity based on local progress to fade out before next phase starts
    const currentOverlay = this.phaseOverlays[currentPhaseIndex];
    if (currentOverlay) {
      if (localProgress > 0.8) {
        // Fade out in the last 20% of the phase
        const fadeOutProgress = (localProgress - 0.8) / 0.2;
        gsap.to(currentOverlay, { opacity: 1 - fadeOutProgress, duration: 0.1 });
      } else {
        // Keep visible
        gsap.to(currentOverlay, { opacity: 1, duration: 0.1 });
      }
    }
  }
  
  animateIn(overlay) {
    if (!overlay) return;
    
    const mainEl = overlay.querySelector('.text-main');
    const subEl = overlay.querySelector('.text-sub');
    const quoteEl = overlay.querySelector('.text-quote');
    const elements = [mainEl, subEl, quoteEl].filter(el => el);
    
    // Kill any existing animations specifically on these elements
    gsap.killTweensOf(elements);
    
    // Reset positions and animate in sequence
    gsap.set(elements, { opacity: 0, y: 30 });
    
    const tl = gsap.timeline();
    
    if (mainEl) {
      tl.to(mainEl, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
    }
    
    if (subEl) {
      tl.to(subEl, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '+=0.3');
    }
    
    if (quoteEl && quoteEl.style.display !== 'none') {
      tl.to(quoteEl, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '+=0.5');
    }
  }
  
  animateOut(overlay) {
    if (!overlay) return;
    
    const elements = overlay.querySelectorAll('.text-main, .text-sub, .text-quote');
    gsap.killTweensOf(elements);
    gsap.to(elements, { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' });
  }
}
