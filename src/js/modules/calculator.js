import { $ } from "./helpers.js";

// ======================
// Калькулятор займа: [data-calculator] с data-rate (% в день)
// Вознаграждение = сумма × ставка × дни, дата погашения = сегодня + дни
// ======================
const formatMoney = (value) => `${Math.round(value).toLocaleString("ru-RU")} ₸`;
const formatDays = (value) => `${value} д.`;

const pluralDays = (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};

export const initCalculator = () => {
  const root = $("[data-calculator]");
  if (!root) return;

  const type = $("[data-calculator-type]", root);
  const amount = $("[data-calculator-amount]", root);
  const days = $("[data-calculator-days]", root);
  const range = days.closest(".calculator__range");
  const daysCurrent = $("[data-calculator-days-current]", root);
  const daysMax = $("[data-calculator-days-max]", root);
  const out = (name) => $(`[data-calculator-out="${name}"]`, root);

  const rate = parseFloat(root.dataset.rate) || 0;
  out("rate").textContent = `${String(rate).replace(".", ",")}%`;

  const getAmount = () => Number(amount.value.replace(/\D/g, "")) || 0;

  const updateRange = () => {
    const min = Number(days.min);
    const max = Number(days.max);
    const value = Number(days.value);

    range.style.setProperty("--progress", (value - min) / (max - min));
    daysCurrent.textContent = formatDays(value);
    days.setAttribute("aria-valuetext", `${value} ${pluralDays(value)}`);

    // У краёв текущее значение заменяет подпись min/max (visibility — чтобы подписи не теряли место)
    const edge = value === min ? "min" : value === max ? "max" : "";
    if (edge) daysCurrent.dataset.edge = edge;
    else daysCurrent.removeAttribute("data-edge");
    daysCurrent.previousElementSibling.style.visibility = edge === "min" ? "hidden" : "";
    daysMax.style.visibility = edge === "max" ? "hidden" : "";
  };

  const calculate = () => {
    const sum = getAmount();
    const term = Number(days.value);
    const reward = sum * (rate / 100) * term;

    const date = new Date();
    date.setDate(date.getDate() + term);

    out("amount").textContent = formatMoney(sum);
    out("reward").textContent = formatMoney(reward);
    out("total").textContent = formatMoney(sum + reward);
    out("date").textContent = date.toLocaleDateString("ru-RU");
  };

  const update = () => {
    updateRange();
    calculate();
  };

  // Максимальный срок зависит от вида залога
  type.addEventListener("change", () => {
    const max = type.selectedOptions[0]?.dataset.maxDays || 30;
    days.max = max;
    if (Number(days.value) > max) days.value = max;
    daysMax.textContent = formatDays(max);
    update();
  });

  // Только цифры, разряды через пробел
  amount.addEventListener("input", () => {
    const sum = getAmount();
    amount.value = sum ? sum.toLocaleString("ru-RU") : "";
    calculate();
  });

  days.addEventListener("input", update);

  update();
};
