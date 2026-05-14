export const responsive = {
  isMobile: () => window.innerWidth < 768,
  getPixelRatio: () => Math.min(window.devicePixelRatio, 2) // Cap at 2 for perf
};
