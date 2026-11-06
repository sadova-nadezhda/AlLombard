// ======================
// Multiplier / s()
// ======================
let multiplier = 1;

export const getWidthMultiplier = () => {
  const w = window.innerWidth;
  const minSide = Math.min(window.innerWidth, window.innerHeight);

  if (w <= 767) return minSide / 375;
  if (w <= 1024) return minSide / 768;
  return window.innerWidth / 1440;
};

export const updateMultiplier = () => {
  multiplier = getWidthMultiplier();
};

export const s = (value) => value * multiplier;
