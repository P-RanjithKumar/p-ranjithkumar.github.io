export const math = {
  lerp: (a, b, t) => a + (b - a) * t,
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
  mapRange: (val, inMin, inMax, outMin, outMax) => {
    return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
  },
  smoothstep: (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }
};
