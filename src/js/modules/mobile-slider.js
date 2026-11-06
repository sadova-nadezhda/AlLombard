import { $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Слайдеры только для мобильных: [data-mobile-slider] (.swiper > .swiper-wrapper > .swiper-slide)
// Отступ между слайдами — data-slider-gap в px макета. На экранах шире 767px Swiper уничтожается
// ======================
export const initMobileSliders = () => {
  const roots = $$("[data-mobile-slider]");
  if (!roots.length || typeof Swiper === "undefined") return null;

  const mq = window.matchMedia("(max-width: 767px)");

  const items = roots.map((root) => ({
    root,
    gap: Number(root.dataset.sliderGap) || 0,
    swiper: null,
  }));

  const toggle = () => {
    items.forEach((item) => {
      if (mq.matches && !item.swiper) {
        item.swiper = new Swiper(item.root, {
          slidesPerView: "auto",
          spaceBetween: s(item.gap),
          watchSlidesProgress: true,
        });
      } else if (!mq.matches && item.swiper) {
        item.swiper.destroy(true, true);
        item.swiper = null;
      }
    });
  };

  // Пересчёт отступов после изменения multiplier
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
