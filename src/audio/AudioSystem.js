export class AudioSystem {
  constructor(url) {
    this.audio = new Audio(url);
    this.audio.loop = true;
    this.audio.volume = 0; // Start at 0, fade in
    
    this.isPlaying = false;
    this.hasInteracted = false;
  }
  
  start() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.fadeIn();
    }).catch(err => {
      console.warn('Audio play failed:', err);
    });
  }
  
  fadeIn() {
    let vol = 0;
    const fadeInterval = setInterval(() => {
      if (vol < 0.5) { // Max volume 0.5 for ambient background
        vol += 0.05;
        this.audio.volume = Math.min(vol, 0.5);
      } else {
        clearInterval(fadeInterval);
      }
    }, 200);
  }
  
  update(scrollProgress) {
    if (!this.isPlaying) return;
    
    // Example: slightly reduce volume during the interview phase (0.50 - 0.70)
    if (scrollProgress >= 0.50 && scrollProgress <= 0.70) {
      this.audio.volume = 0.2;
    } else {
      this.audio.volume = 0.5;
    }
  }
}
