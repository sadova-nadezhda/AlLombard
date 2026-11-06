import { $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Слайдеры секций: [data-slider="<пресет>"], стрелки .slider-btn внутри секции
// Отступ между слайдами — в px макета: gap[0] на мобильном, gap[1] на остальных экранах
// ======================
const presets = {
  // Два ряда (Swiper Grid), заполнение по колонкам
  // grid повторяется в брейкпоинтах: без него Swiper отключает сетку при смене брейкпоинта
  partners: {
    gap: [8, 20],
    options: {
      slidesPerView: 1.2,
      grid: { rows: 2, fill: "column" },
      breakpoints: {
        768: { slidesPerView: 3, grid: { rows: 2, fill: "column" } },
        1025: { slidesPerView: 4, grid: { rows: 2, fill: "column" } },
      },
    },
  },
  // На мобильном ширина слайда задаётся в CSS
  reviews: {
    gap: [8, 20],
    options: {
      slidesPerView: "auto",
      breakpoints: {
        768: { slidesPerView: 2 },
        1025: { slidesPerView: 3 },
      },
    },
  },
  // Ширина слайдов — по пропорциям картинок, задаётся в CSS
  awards: {
    gap: [8, 20],
    options: {
      slidesPerView: "auto",
    },
  },
};

export const initSliders = () => {
  const roots = $$("[data-slider]").filter((root) => presets[root.dataset.slider]);
  if (!roots.length || typeof Swiper === "undefined") return null;

  const mq = window.matchMedia("(max-width: 767px)");
  const getGap = ([mobile, other]) => s(mq.matches ? mobile : other);

  const sliders = roots.map((root) => {
    const { gap, options } = presets[root.dataset.slider];
    const section = root.closest("section");

    const swiper = new Swiper(root, {
      ...options,
      spaceBetween: getGap(gap),
      navigation: {
        prevEl: section?.querySelector(".slider-btn--prev"),
        nextEl: section?.querySelector(".slider-btn--next"),
      },
    });

    return { swiper, gap };
  });

  // Пересчёт отступов после изменения multiplier
  const update = () => {
    sliders.forEach(({ swiper, gap }) => {
      swiper.params.spaceBetween = getGap(gap);
      swiper.update();
    });
  };

  return { update };
};
