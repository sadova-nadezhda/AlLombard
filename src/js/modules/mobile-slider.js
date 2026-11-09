import { $$ } from "./helpers.js";
import { s } from "./multiplier.js";
import { getAutoplayOptions, bindAutoplay } from "./autoplay.js";

// ======================
// Слайдеры только для мобильных
// ======================
export const initMobileSliders = () => {
  const roots = $$("[data-mobile-slider]");
  if (!roots.length || typeof Swiper === "undefined") return null;

  const mq = window.matchMedia("(max-width: 767px)");

  const items = roots.map((root) => ({
    root,
    gap: Number(root.dataset.sliderGap) || 0,
    swiper: null,
    unbindAutoplay: null,
  }));

  const toggle = () => {
    items.forEach((item) => {
      if (mq.matches && !item.swiper) {
        item.swiper = new Swiper(item.root, {
          ...getAutoplayOptions(),
          slidesPerView: "auto",
          spaceBetween: s(item.gap),
          watchSlidesProgress: true,
        });
        item.unbindAutoplay = bindAutoplay(item.swiper);
      } else if (!mq.matches && item.swiper) {
        item.unbindAutoplay();
        item.swiper.destroy(true, true);
        item.swiper = null;
      }
    });
  };

  const update = () => {
    items.forEach(({ swiper, gap }) => {
      if (!swiper) return;
      swiper.params.spaceBetween = s(gap);
      swiper.update();
    });
  };

  toggle();
  mq.addEventListener("change", toggle);

  return { update };
};
