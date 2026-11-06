import { $$ } from "./helpers.js";

// ======================
// Phone mask
// ======================
export const initPhoneMask = () => {
  const inputs = $$('input[type="tel"]');
  if (!inputs.length) return;

  const format = (value, matrix) => {
    const prefix = matrix.replace(/\D/g, "");
    const slots = (matrix.match(/[_\d]/g) || []).length;
    const free = slots - prefix.length;
    const head = matrix.slice(0, matrix.indexOf("_"));

    let body = value.startsWith(head)
      ? value.slice(head.length).replace(/\D/g, "")
      : value.replace(/\D/g, "");

    // Номер набирают и через +7, и через 8 — это одно и то же.
    // Ведущую 8 убираем сразу, иначе номер съезжает и теряется последняя цифра.
    if (prefix === "7" && body.startsWith("8")) {
      body = body.slice(1);
    } else if (body.length > free && body.startsWith(prefix)) {
      // Код страны при вставке целого номера: 7 747 123 45 67
      body = body.slice(prefix.length);
    }

    body = body.slice(0, free);
    if (!body) return "";

    const digits = prefix + body;
    let res = "";
    let i = 0;
    for (const ch of matrix) {
      if (/[_\d]/.test(ch)) {
        if (i >= digits.length) break;
        res += digits[i++];
      } else {
        res += ch;
      }
    }
    return res.replace(/\D+$/, "");
  };

  inputs.forEach((input) => {
    const matrix = input.dataset.mask || "+7 (___) ___ ____";
    const prefix = matrix.replace(/\D/g, "");

    input.addEventListener("input", (e) => {
      const entered = input.value.replace(/\D/g, "");
      if (e.inputType?.startsWith("delete") && entered.length <= prefix.length) {
        input.value = "";
        return;
      }
      input.value = format(input.value, matrix);
    });
  });
};
