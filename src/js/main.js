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
    const HIDE_DELTA = 10;
    const SHOW_DELTA = 40;
    let lastY = window.scrollY;
    let delta = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0));
      header.classList.toggle("scrolled", y > 10);

      const diff = y - lastY;
      lastY = y;
      if (!diff) return;
      delta = Math.sign(diff) === Math.sign(delta) ? delta + diff : diff;

      const busy = header.classList.contains("is-open") || header.querySelector(".is-open");
      if (busy || y <= header.offsetHeight) {
        header.classList.remove("is-hidden");
      } else if (delta > HIDE_DELTA) {
        header.classList.add("is-hidden");
      } else if (delta < -SHOW_DELTA) {
        header.classList.remove("is-hidden");
      }
    };

    update();
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true },
    );
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
    const modals = initModals({ scrollLock, closeMobileMenu: menu?.close });
    initAnimations();

    refreshLayout();

    window.addEventListener("resize", debounce(() => {
      updateMultiplier();
      mobileSliders?.update();
      sliders?.update();
      refreshLayout();
    }, 150));
  });
})();
