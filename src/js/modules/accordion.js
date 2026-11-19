import { $$ } from "./helpers.js";
import { refreshLayout } from "./layout.js";

// ======================
// Аккордеон
// data-accordion="single" — открыт только один пункт, иначе пункты раскрываются независимо
// Начальное состояние — класс is-open в разметке
// ======================
const setOpen = (item, open) => {
  item.classList.toggle("is-open", open);
  item.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", String(open));
};

export const initAccordions = () => {
  const items = $$("[data-accordion] [data-accordion-item]");
  if (!items.length) return;

  items.forEach((item) => {
    const toggle = item.querySelector("[data-accordion-toggle]");
    const panel = item.querySelector("[data-accordion-panel]");
    if (!toggle || !panel) return;

    const root = item.closest("[data-accordion]");
    const single = root.dataset.accordion === "single";

    toggle.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      if (open && single) {
        $$("[data-accordion-item].is-open", root).forEach((other) => setOpen(other, false));
      }
      setOpen(item, open);
    });

    panel.addEventListener("transitionend", (e) => {
      if (e.target === panel && e.propertyName === "grid-template-rows") refreshLayout();
    });
  });
};
