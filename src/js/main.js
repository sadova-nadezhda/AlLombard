// Точка входа → dist/js/main.js (esbuild, один файл)
import { $, debounce } from "./modules/helpers.js";
import { updateMultiplier } from "./modules/multiplier.js";
import { refreshLayout } from "./modules/layout.js";
import { initLenis } from "./modules/lenis.js";
import { createScrollLock } from "./modules/scroll-lock.js";
import { initModals } from "./modules/modals.js";
import { initPhoneMask } from "./modules/phone-mask.js";
import { initMenu } from "./modules/menu.js";
import { initDropdowns } from "./modules/dropdown.js";
import { initMobileSliders } from "./modules/mobile-slider.js";
import { initCalculator } from "./modules/calculator.js";
import { initSliders } from "./modules/slider.js";
import { initContactsMap } from "./modules/contacts-map.js";
import { initAnimations } from "./modules/animations.js";

(() => {
  "use strict";

  const initHeader = () => {
    const header = $(".header");
    if (!header) return;
    let lastY = window.scrollY;

    // .scrolled — страница прокручена; .is-hidden — шапка уехала вверх при скролле вниз
    const update = () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 10);
      if (Math.abs(y - lastY) < 5) return; // порог от дрожания
      // Не прячем, пока открыто меню или выпадающий список языков
      const busy = header.classList.contains("is-open") || header.querySelector(".is-open");
      header.classList.toggle("is-hidden", y > lastY && y > header.offsetHeight && !busy);
      lastY = y;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    // Фокус с клавиатуры внутри шапки — показываем её
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateMultiplier();
    const lenis = initLenis();
    const scrollLock = createScrollLock(lenis);

    initHeader();
    initPhoneMask();
    initDropdowns();
    initCalculator();
    initContactsMap();
    const mobileSliders = initMobileSliders();
    const sliders = initSliders();
    const menu = initMenu({ scrollLock });
    const modals = initModals({ scrollLock, closeMobileMenu: menu?.close }); // modals.open("success") — открыть из кода
    initAnimations(); // после слайдеров: ScrollTrigger меряет уже готовую раскладку

    refreshLayout();

    window.addEventListener("resize", debounce(() => {
      updateMultiplier();
      mobileSliders?.update();
      sliders?.update();
      refreshLayout();
    }, 150));
  });
})();
