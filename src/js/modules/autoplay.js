// ======================
// Автоплей слайдеров
// ======================
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export const getAutoplayOptions = () => ({
  rewind: true,
  autoplay: reducedMotion.matches
    ? false
    : {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
});

export const bindAutoplay = (swiper) => {
  if (!swiper.params.autoplay?.enabled) return () => {};

  const root = swiper.el;
  let visible = false;
  let focused = false;

  const sync = () => {
    if (visible && !focused) swiper.autoplay.start();
    else swiper.autoplay.stop();
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(root);

  const onFocusIn = () => {
    focused = true;
    sync();
  };
  const onFocusOut = (e) => {
    if (root.contains(e.relatedTarget)) return;
    focused = false;
    sync();
  };
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);

  return () => {
    observer.disconnect();
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
  };
};
