export class EndScreen {
  constructor() {
    this.element = document.getElementById('end-screen');
    this.btnReplay = document.getElementById('btn-replay');
    
    if (this.btnReplay) {
      this.btnReplay.addEventListener('click', () => {
        if (window.__smoothScroll) {
          window.__smoothScroll.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }
  
  show() {
    if (this.element) {
      this.element.classList.remove('end-screen--hidden');
    }
  }
  
  hide() {
    if (this.element) {
      this.element.classList.add('end-screen--hidden');
    }
  }
  
  update(progress) {
    // Show end screen when near the very end
    if (progress > 0.98) {
      this.show();
    } else {
      this.hide();
    }
  }
}
