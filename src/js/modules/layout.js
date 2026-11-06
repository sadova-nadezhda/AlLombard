// ======================
// Пересчёт раскладки (Lenis + ScrollTrigger)
// ======================
const refreshLenis = () => {
  if (window.lenis && typeof window.lenis.resize === "function") window.lenis.resize();
};

const layoutFrozen = () =>
  document.documentElement.classList.contains("is-loading") ||
  document.body.classList.contains("no-scroll");

let layoutPending = false;

export const refreshLayout = () => {
  if (layoutFrozen()) { layoutPending = true; return; }
  layoutPending = false;
  refreshLenis();
  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
};

export const flushLayout = () => {
  if (layoutPending) requestAnimationFrame(refreshLayout);
};
