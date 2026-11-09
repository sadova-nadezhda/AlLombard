import { $$ } from "./helpers.js";

// ======================
// Выпадающие списки: [data-dropdown] > [data-dropdown-toggle] + список
// ======================
export const initDropdowns = () => {
  const dropdowns = $$("[data-dropdown]");
  if (!dropdowns.length) return;

  const canHover = window.matchMedia("(hover: hover)");

  const items = dropdowns.map((root) => {
    const toggle = root.querySelector("[data-dropdown-toggle]");
    let timer;

    const set = (open) => {
      clearTimeout(timer);
      root.classList.toggle("is-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
    };

    const open = () => {
      items.forEach((item) => item.root !== root && item.set(false));
      set(true);
    };

    const isOpen = () => root.classList.contains("is-open");

    root.addEventListener("mouseenter", () => {
      if (canHover.matches) open();
    });

    // Небольшая задержка
    root.addEventListener("mouseleave", () => {
      if (!canHover.matches) return;
      clearTimeout(timer);
      timer = setTimeout(() => set(false), 150);
    });

    toggle?.addEventListener("click", () => (isOpen() ? set(false) : open()));

    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) set(false);
    });

    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        set(false);
        toggle?.focus();
      }
    });

    return { root, set };
  });

  document.addEventListener("click", (e) => {
    items.forEach(({ root, set }) => {
      if (!root.contains(e.target)) set(false);
    });
  });
};
