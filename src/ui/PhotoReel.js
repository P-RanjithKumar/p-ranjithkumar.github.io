import { gsap } from 'gsap';
import * as THREE from 'three';
import { PHASES } from '../scroll/phaseConfig.js';
import { math } from '../utils/math.js';

const PHOTO_QUOTES = [
  "Before anything else, there is you. My favorite beginning is always with you.",
  "You spice up my life in the most delicious ways. Every moment with you is a treat.",
  "Traditional grace meets modern sass. You’re the only masterpiece I’ll ever need.",
  "Even when you're just lost in your phone, I'm lost in your beauty. You're my favorite view.",
  "Sending a kiss your way, though I'd much rather deliver it in person. You're my heart's rhythm.",
  "Even the wind wants to play with your hair. You're naturally magical, my love.",
  "The flowers are beautiful, but they all pale in comparison to your smile. You're my sunshine.",
  "Held in your gaze, I find everything I've ever searched for. You are my home.",
  "Pure elegance and peace. Just sitting with you is the greatest adventure of my life.",
  "The sun sets only to make way for your glow. You outshine every horizon.",
  "Every path I take leads back to you. Walking through life with you is my favorite journey.",
  "Your laugh is the soundtrack I want to play on repeat. You make every corner of the world brighter.",
  "Radiating beauty in every color. You're the vibrant soul that makes my world complete.",
  "Under these lights, you're the only star I see. You're my forever and always."
];

export class PhotoReel {
  constructor(camera) {
    this.camera = camera;
    this.container = document.getElementById('photo-container');
    this.photos = [];
    this.quotes = [];
    this.totalPhotos = 14;
    this.photosPerPhase = 2; // 14 photos / 7 phases
    
    // A vector representing roughly the chest/center of the 3D model
    this.modelCenter3D = new THREE.Vector3(0, 1.0, 0);
    
    this.initPhotos();
  }
  
  initPhotos() {
    if (!this.container) return;
    
    // Create 14 photo elements
    for (let i = 1; i <= this.totalPhotos; i++) {
      const img = document.createElement('img');
      img.src = `photos/photo_${i}.webp`;
      img.className = 'cinematic-photo';
      
      // Determine if this photo comes from left or right
      // First photo in a phase (odd numbers) comes from the right
      // Second photo in a phase (even numbers) comes from the left
      const isLeft = i % 2 === 0;
      img.dataset.side = isLeft ? 'left' : 'right';
      
      // Randomize vertical position slightly (-15vh to +15vh from center)
      const yOffset = (Math.random() - 0.5) * 30;
      img.dataset.yOffset = yOffset;
      
      // Randomize slight rotation (-10deg to +10deg)
      const rotation = (Math.random() - 0.5) * 20;
      img.dataset.rotation = rotation;
      
      this.container.appendChild(img);
      this.photos.push(img);
      
      // Initial hidden state
      gsap.set(img, {
        x: isLeft ? '-100vw' : '100vw',
        yPercent: -50 + yOffset,
        top: '50%',
        rotation: rotation,
        opacity: 0,
        scale: 0.8
      });

      // Create matching quote element
      const quoteDiv = document.createElement('div');
      quoteDiv.className = 'photo-quote-overlay';
      
      const p = document.createElement('p');
      const text = PHOTO_QUOTES[i - 1];
      const chars = [];
      
      const words = text.split(' ');
      let charIndex = 0;
      const totalChars = text.length;
      
      for (let w = 0; w < words.length; w++) {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'quote-word';
        
        // Add a space after the word, except for the last word
        const wordText = words[w] + (w < words.length - 1 ? ' ' : '');
        
        for (let c = 0; c < wordText.length; c++) {
          const char = wordText[c];
          const span = document.createElement('span');
          span.className = 'quote-char';
          span.innerHTML = char === ' ' ? '&nbsp;' : char;
          
          // Random targets for dust glitter scatter
          span.dataset.targetX = (Math.random() - 0.5) * 30; // Reduced distance
          span.dataset.targetY = (Math.random() - 0.5) * 30; // Reduced distance
          span.dataset.targetRot = (Math.random() - 0.5) * 180; // Smoother rotation
          
          // Sequential left-to-right delay
          span.dataset.scatterDelay = (charIndex / totalChars) * 0.5; 
          
          wordSpan.appendChild(span);
          chars.push(span);
          charIndex++;
        }
        p.appendChild(wordSpan);
      }
      
      quoteDiv.appendChild(p);
      this.container.appendChild(quoteDiv);
      
      this.quotes.push({
        container: quoteDiv,
        chars: chars
      });

      // Quote starts opposite to the photo
      gsap.set(quoteDiv, {
        x: isLeft ? '100vw' : '-100vw',
        yPercent: -50 + yOffset,
        top: '50%',
        opacity: 0
      });
    }
  }
  
  update(scrollProgress, currentPhaseIndex, localProgress) {
    if (!this.photos.length || !this.camera) return;
    
    // Dynamically calculate exactly where the 3D model is on the 2D screen right now
    const projectedCenter = this.modelCenter3D.clone();
    projectedCenter.project(this.camera);
    // Convert NDC (-1 to 1) to vw (0 to 100)
    // ndc.x of -1 means 0vw, ndc.x of 1 means 100vw
    const targetX_vw = ((projectedCenter.x + 1) / 2) * 100;
    
    // Offset slightly so left photo goes to left side of model, right photo to right side
    const modelOffset = 5; // 5vw offset
    const targetLeft = targetX_vw - modelOffset;
    const targetRight = targetX_vw + modelOffset - 22; // -22vw is the image width, roughly
    
    this.photos.forEach((img, idx) => {
      const phaseAssigned = Math.floor(idx / this.photosPerPhase);
      const phaseConfig = PHASES[phaseAssigned];
      const isLeft = img.dataset.side === 'left';
      
      let progressInPhase = 0;
      if (scrollProgress <= phaseConfig.start) {
        progressInPhase = 0;
      } else if (scrollProgress >= phaseConfig.end) {
        progressInPhase = 1;
      } else {
        progressInPhase = math.mapRange(scrollProgress, phaseConfig.start, phaseConfig.end, 0, 1);
      }
      
      // Stagger the two photos in the phase so they don't enter at the same time
      // The first photo (Right) acts from 0.0 to 0.5 of the phase
      // The second photo (Left) acts from 0.5 to 1.0 of the phase
      const isFirstInPhase = (idx % 2) === 0;
      let localPhotoProgress = 0;
      
      if (isFirstInPhase) {
        if (progressInPhase <= 0) localPhotoProgress = 0;
        else if (progressInPhase >= 0.5) localPhotoProgress = 1;
        else localPhotoProgress = math.mapRange(progressInPhase, 0, 0.5, 0, 1);
      } else {
        if (progressInPhase <= 0.5) localPhotoProgress = 0;
        else if (progressInPhase >= 1) localPhotoProgress = 1;
        else localPhotoProgress = math.mapRange(progressInPhase, 0.5, 1.0, 0, 1);
      }
      
      const easeProgress = this.easeOutSine(localPhotoProgress);
      
      const isLastPhoto = (idx === this.totalPhotos - 1);
      const quoteObj = this.quotes[idx];
      const quoteEl = quoteObj.container;
      const chars = quoteObj.chars;
      
      if (localPhotoProgress === 0) {
        gsap.set(img, { opacity: 0, x: isLeft ? '-100vw' : '100vw' });
        gsap.set(quoteEl, { opacity: 0, x: isLeft ? '100vw' : '-100vw' });
      } else if (localPhotoProgress === 1) {
        if (isLastPhoto) {
          // Last photo becomes the background!
          gsap.set(img, { opacity: 0.3, scale: 6.0, x: '39vw', rotation: 0 });
          gsap.set(quoteEl, { opacity: 0 });
        } else {
          gsap.set(img, { opacity: 0, scale: 0.0 });
          gsap.set(quoteEl, { opacity: 0 });
        }
      } else {
        
        let currentX, opacity, scale, currentRot;
        let quoteX, quoteOpacity;
        let textScale = 1;
        
        if (isLastPhoto) {
          // For the final photo, it centers on the screen and explodes into the background
          const startX = isLeft ? -25 : 100;
          currentX = math.mapRange(easeProgress, 0, 1, startX, 39); // 39vw is screen center (50 - 11)
          
          if (easeProgress < 0.15) opacity = (easeProgress / 0.15) * 0.7;
          else if (easeProgress > 0.7) opacity = math.mapRange(easeProgress, 0.7, 1.0, 0.7, 0.3);
          else opacity = 0.7;
          
          if (easeProgress < 0.5) {
             scale = Math.sin(easeProgress * Math.PI) * 1.1;
          } else {
             const expansionProgress = (easeProgress - 0.5) * 2; // 0 to 1
             scale = 1.1 + Math.pow(expansionProgress, 2) * 4.9; // expands to 6.0
          }
          
          const startRot = parseFloat(img.dataset.rotation);
          currentRot = math.mapRange(easeProgress, 0, 1, startRot, 0);
          
          const lastQuoteEndX = isLeft ? 62 : 13;
          const lastQuoteStartX = isLeft ? lastQuoteEndX + 15 : lastQuoteEndX - 15;
          quoteX = math.mapRange(easeProgress, 0, 1, lastQuoteStartX, lastQuoteEndX);
          quoteOpacity = opacity;
          textScale = 1;
          
        } else {
          // Normal photo behavior
          const startX = isLeft ? -25 : 100;
          const endX = targetX_vw - 11; // center the 22vw image on the model
          
          currentX = math.mapRange(easeProgress, 0, 1, startX, endX);
          
          if (easeProgress < 0.15) opacity = easeProgress / 0.15;
          else if (easeProgress > 0.7) opacity = Math.max(0, 1 - ((easeProgress - 0.7) / 0.2));
          else opacity = 1;
          
          scale = Math.sin(easeProgress * Math.PI) * 1.1;
          scale = Math.max(0, scale);
          
          const startRot = parseFloat(img.dataset.rotation);
          currentRot = math.mapRange(easeProgress, 0, 1, startRot, startRot * 0.1);
          
          // Photo quote logic: text perfectly flanks the photo on the opposite side of entry
          const quoteEndX = isLeft ? targetX_vw + 12 : targetX_vw - 37;
          const quoteStartX = isLeft ? quoteEndX + 15 : quoteEndX - 15;
          
          quoteX = math.mapRange(easeProgress, 0, 1, quoteStartX, quoteEndX);
          quoteOpacity = opacity; // Perfectly syncs fading with the photo
          textScale = 1; 
          
          opacity *= 0.7;
        }

        // Dust glitter scatter effect for outgoing phase
        if (easeProgress > 0.7) {
          quoteOpacity = 1; // Keep container visible so characters can manage their own fade
          const scatterProgress = (easeProgress - 0.7) / 0.3; // 0 to 1
          
          const shatterIndex = (scatterProgress / 0.5) * chars.length;
          
          chars.forEach((span, i) => {
            const delay = parseFloat(span.dataset.scatterDelay);
            // Local progress for this char, duration is 0.5 so max delay (0.5) finishes exactly at scatterProgress = 1.0
            let p = (scatterProgress - delay) / 0.5;
            
            // Calculate how much 'p' space represents exactly 1 character
            const charP = 1 / chars.length;
            const shrinkDuration = charP * 3; // Shrink over exactly 3 characters
            const holdDuration = charP * 2;   // Hold and glitter intensely over 2 characters
            const inPlaceDuration = shrinkDuration + holdDuration;
            
            if (p <= 0) {
              // Waiting for its turn
              let brightness = 1;
              let glow = 0;
              let localScale = 1;
              
              const distance = i - shatterIndex;
              // Expand zone to 9 characters so the "shine wave" at 5-6 can be seen clearly
              if (distance > 0 && distance <= 9) {
                
                // 1. Immediate neighbouring chars glow heavily (0 to 3 chars away)
                const immediateWeight = distance <= 3 ? Math.pow(1 - (distance / 3), 1.5) : 0;
                
                // 2. Traveling "shine wave" (peaks exactly at 5.5 chars away)
                // Using a Gaussian bell curve that is 1.0 at distance 5.5 and decays smoothly
                const wavePeak = 5.5;
                const waveWidth = 1.5; 
                const shineWave = Math.exp(-Math.pow(distance - wavePeak, 2) / waveWidth);
                
                const baseWeight = Math.max(immediateWeight, shineWave);
                
                // High-frequency sharp flashes
                const sparkle1 = Math.pow(Math.sin(scatterProgress * 350 + i * 4.5), 10);
                const sparkle2 = Math.pow(Math.cos(scatterProgress * 250 - i * 3.2), 10);
                const combinedSparkle = Math.max(sparkle1, sparkle2);
                
                // Increase the base brightness multiplier so they glow much more, even without sparkles
                brightness = 1 + (baseWeight * 5.0) + (baseWeight * combinedSparkle * 8.0);
                glow = (baseWeight * 25) + (baseWeight * combinedSparkle * 40);
                localScale = 1 + (baseWeight * 0.15) + (baseWeight * combinedSparkle * 0.2);
              }

              gsap.set(span, { 
                x: 0, 
                y: 0, 
                rotation: 0, 
                scale: localScale, 
                filter: `brightness(${brightness}) drop-shadow(0 0 ${glow}px #d4a855) blur(0px)`, 
                opacity: 1 
              });
            } else if (p < 1) {
              // Phase 1: Shrink in place
              let glitterP = Math.min(1, p / shrinkDuration);
              
              // Phase 2: Shatter and fly
              let shatterP = p > inPlaceDuration ? (p - inPlaceDuration) / (1 - inPlaceDuration) : 0;
              
              const easeOut = 1 - Math.pow(1 - shatterP, 3);
              
              const x = parseFloat(span.dataset.targetX) * easeOut;
              const y = parseFloat(span.dataset.targetY) * easeOut;
              const rot = parseFloat(span.dataset.targetRot) * easeOut + (shatterP * 720); 
              
              const blur = glitterP * 5; 
              
              // Sparkle is wild during the hold phase
              const sparkle = Math.pow(Math.sin(scatterProgress * 450 + i * 7.1), 8);
              
              // If holding in place (fully shrunk, but hasn't flown yet)
              let holdIntensifier = 0;
              if (p > shrinkDuration && p <= inPlaceDuration) {
                 const holdProgress = (p - shrinkDuration) / holdDuration;
                 holdIntensifier = Math.sin(holdProgress * Math.PI); // Parabola: peaks in the middle of hold
              }
              
              const localScale = 1 - glitterP * 0.9 + (sparkle * 0.15) + (holdIntensifier * 0.1);
              
              const brightness = 1 + glitterP * 8.0 + sparkle * 15.0 + holdIntensifier * 10.0;
              const glow = glitterP * 30 + sparkle * 40 + holdIntensifier * 30;
              
              gsap.set(span, {
                x: `${x}vw`,
                y: `${y}vh`,
                rotation: rot,
                scale: localScale, 
                filter: `brightness(${brightness}) drop-shadow(0 0 ${glow}px #d4a855) blur(${blur}px)`,
                opacity: 1 - Math.pow(shatterP, 2) 
              });
            } else {
              gsap.set(span, { opacity: 0 }); 
            }
          });
        } else {
          // Reset chars during incoming/held phase
          chars.forEach(span => {
            gsap.set(span, { x: 0, y: 0, rotation: 0, scale: 1, filter: 'brightness(1) drop-shadow(0 0 0px #d4a855) blur(0px)', opacity: 1 });
          });
        }
        
        gsap.set(img, {
          x: `${currentX}vw`,
          opacity: opacity,
          scale: scale,
          rotation: currentRot
        });

        gsap.set(quoteEl, {
          x: `${quoteX}vw`,
          opacity: quoteOpacity,
          scale: textScale
        });
      }
    });
  }
  
  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  }
}
