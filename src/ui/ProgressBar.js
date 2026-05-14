export class ProgressBar {
  constructor() {
    this.element = document.getElementById('progress-bar');
  }
  
  update(progress) {
    if (this.element) {
      this.element.style.transform = `scaleY(${progress})`;
    }
  }
}
