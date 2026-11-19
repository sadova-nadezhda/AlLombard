import { $$ } from "./helpers.js";
import { refreshLayout } from "./layout.js";

// ======================
// «Показать еще»
// data-show-more="6" — список, число — сколько элементов показывать за раз
// data-show-more-item — элементы списка
// data-show-more-btn="<id списка>" — кнопка
// Без JS видны все элементы
// ======================
export const initShowMore = () => {
  $$("[data-show-more]").forEach((list) => {
    const step = parseInt(list.dataset.showMore, 10) || 6;
    const items = $$("[data-show-more-item]", list);
    const btn = list.id ? document.querySelector(`[data-show-more-btn="${list.id}"]`) : null;
    if (!btn || items.length <= step) return;

    items.slice(step).forEach((item) => { item.hidden = true; });
    btn.hidden = false;

    btn.addEventListener("click", () => {
      const next = items.filter((item) => item.hidden).slice(0, step);
      next.forEach((item) => { item.hidden = false; });

      next[0]?.querySelector("a, button")?.focus({ preventScroll: true });

      if (!items.some((item) => item.hidden)) btn.hidden = true;
      refreshLayout();
    });
  });
};
