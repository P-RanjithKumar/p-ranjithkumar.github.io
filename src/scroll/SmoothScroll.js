import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class SmoothScroll {
  constructor({
    lerp = 0.07,
    wheelMultiplier = 0.9,
    maxStep = 220,
    touchMultiplier = 1.6,
    keyStep = 120,
  } = {}) {
    this.lerp = lerp;
    this.wheelMultiplier = wheelMultiplier;
    this.maxStep = maxStep;
    this.touchMultiplier = touchMultiplier;
    this.keyStep = keyStep;

    this.targetY = window.scrollY || 0;
    this.currentY = this.targetY;
    this.maxY = 0;
    this.enabled = false;
    this.lastTouchY = 0;

    this._onWheel = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onResize = this._onResize.bind(this);
    this._tick = this._tick.bind(this);
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    this._recomputeBounds();

    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onResize);

    requestAnimationFrame(this._tick);
  }

  _recomputeBounds() {
    this.maxY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  _onResize() {
    this._recomputeBounds();
    this.targetY = Math.min(this.targetY, this.maxY);
  }

  _clampStep(delta) {
    if (delta > this.maxStep) return this.maxStep;
    if (delta < -this.maxStep) return -this.maxStep;
    return delta;
  }

  _onWheel(e) {
    e.preventDefault();
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 16;
    else if (e.deltaMode === 2) delta *= window.innerHeight;
    delta *= this.wheelMultiplier;
    delta = this._clampStep(delta);
    this.targetY = Math.max(0, Math.min(this.maxY, this.targetY + delta));
  }

  _onTouchStart(e) {
    this.lastTouchY = e.touches[0].clientY;
  }

  _onTouchMove(e) {
    e.preventDefault();
    const y = e.touches[0].clientY;
    let delta = (this.lastTouchY - y) * this.touchMultiplier;
    this.lastTouchY = y;
    delta = this._clampStep(delta);
    this.targetY = Math.max(0, Math.min(this.maxY, this.targetY + delta));
  }

  _onKeyDown(e) {
    let delta = 0;
    switch (e.key) {
      case 'ArrowDown': delta = this.keyStep; break;
      case 'ArrowUp': delta = -this.keyStep; break;
      case 'PageDown': delta = window.innerHeight * 0.6; break;
      case 'PageUp': delta = -window.innerHeight * 0.6; break;
      case ' ': delta = e.shiftKey ? -window.innerHeight * 0.6 : window.innerHeight * 0.6; break;
      case 'Home': this.targetY = 0; e.preventDefault(); return;
      case 'End': this.targetY = this.maxY; e.preventDefault(); return;
      default: return;
    }
    e.preventDefault();
    delta = this._clampStep(delta);
    this.targetY = Math.max(0, Math.min(this.maxY, this.targetY + delta));
  }

  scrollTo(y) {
    this.targetY = Math.max(0, Math.min(this.maxY, y));
  }

  _tick() {
    if (!this.enabled) return;
    const diff = this.targetY - this.currentY;
    if (Math.abs(diff) < 0.5) {
      this.currentY = this.targetY;
    } else {
      this.currentY += diff * this.lerp;
    }
    window.scrollTo(0, this.currentY);
    if (ScrollTrigger && ScrollTrigger.update) ScrollTrigger.update();
    requestAnimationFrame(this._tick);
  }
}
