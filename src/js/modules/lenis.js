import { s } from "./multiplier.js";

// ======================
// Lenis
// ======================
export const initLenis = () => {
  if (typeof Lenis === "undefined") return null;
  const useGsapTicker = typeof gsap !== "undefined";
  const lenis = new Lenis({
    autoRaf: !useGsapTicker,
    anchors: { offset: -Math.round(s(120)) },
  });
  window.lenis = lenis;

  document.documentElement.style.scrollBehavior = "auto";

  if (useGsapTicker) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  return lenis;
};
