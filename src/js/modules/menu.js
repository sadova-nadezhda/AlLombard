import { $, $$ } from "./helpers.js";

// ======================
// Мобильное меню (бургер в шапке)
// ======================
export const initMenu = ({ scrollLock } = {}) => {
  const header = $(".header");
  const burger = header && $(".header__burger", header);
  if (!header || !burger) return;

  const isOpen = () => header.classList.contains("is-open");

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    if (open) {
      scrollLock?.lock?.("menu");
    } else {
      scrollLock?.unlock?.("menu");
    }
  };

  const close = () => {
    if (isOpen()) setOpen(false);
  };

  burger.addEventListener("click", () => setOpen(!isOpen()));

  $$(".header__menu-link", header).forEach((link) => link.addEventListener("click", close));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      close();
      burger.focus();
    }
  });

  window.matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
    if (e.matches) close();
  });

  return { close };
};
