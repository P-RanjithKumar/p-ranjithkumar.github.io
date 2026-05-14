export class Loader {
  constructor() {
    this.element = document.getElementById('loader');
    this.textElement = this.element ? this.element.querySelector('.loader-text') : null;
  }
  
  show() {
    if (this.element) {
      this.element.classList.remove('loader--hidden');
    }
  }
  
  readyToStart(onStartCallback) {
    if (this.element && this.textElement) {
      this.textElement.textContent = "Click to Begin";
      this.element.style.cursor = 'pointer';
      
      const handleClick = () => {
        this.hide();
        this.element.removeEventListener('click', handleClick);
        if (onStartCallback) onStartCallback();
      };
      
      this.element.addEventListener('click', handleClick);
    } else {
      // Fallback if elements not found
      if (onStartCallback) onStartCallback();
      this.hide();
    }
  }
  
  hide() {
    if (this.element) {
      this.element.classList.add('loader--hidden');
    }
  }
}
