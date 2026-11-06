import { flushLayout } from "./layout.js";

// ======================
// Блокировка скролла (модалки, меню) по ключам
// ======================
export const createScrollLock = (lenis) => {
  const locks = new Set();

  const apply = () => {
    if (locks.size) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbar}px`);
      document.body.classList.add("no-scroll");
      lenis?.stop?.();
    } else {
      document.body.classList.remove("no-scroll");
      document.documentElement.style.setProperty("--scrollbar-width", "0px");
      lenis?.start?.();
      flushLayout();
    }
  };

  return {
    lock: (key) => {
      if (!key) return;
      locks.add(key);
      apply();
    },
    unlock: (key) => {
      if (!key) return;
      locks.delete(key);
      apply();
    },
    reset: () => {
      locks.clear();
      apply();
    },
    has: (key) => locks.has(key),
  };
};
