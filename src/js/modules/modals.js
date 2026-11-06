import { $, $$ } from "./helpers.js";

// ======================
// Modals
// ======================
export const initModals = ({ scrollLock, closeMobileMenu } = {}) => {
  const wrapper = $(".modals");
  if (!wrapper) return;

  const modals = $$(".modal", wrapper);
  const getModalByType = (type) => wrapper.querySelector(`.modal[data-type="${type}"]`);

  const showWrapper = () => {
    wrapper.style.opacity = 1;
    wrapper.style.pointerEvents = "auto";
    scrollLock?.lock?.("modal");
  };

  const hideWrapper = () => {
    wrapper.style.opacity = 0;
    wrapper.style.pointerEvents = "none";
    scrollLock?.unlock?.("modal");
  };

  const fillFromCard = (modal, btn) => {
    const card = btn.closest("[data-modal-source]");
    if (!modal || !card) return;

    const modalImg = $(".modal__img img", modal);
    const cardImg = $("[data-modal-img]", card);
    if (modalImg && cardImg) {
      modalImg.src = cardImg.src;
      modalImg.alt = cardImg.alt;
    }

    const title = $(".modal__title", modal);
    if (title) title.textContent = $("[data-modal-title]", card)?.textContent.trim() ?? "";

    const text = $(".modal__text", modal);
    if (text) text.innerHTML = $("[data-modal-text]", card)?.innerHTML ?? "";
  };

  const fillTopic = (modal, btn) => {
    if (!modal) return;

    const source = btn.closest(".modal");
    const topic = source ? $(".modal__title", source)?.textContent.trim() ?? "" : "";
    const label = source?.dataset.topicLabel ?? "";

    $$("[data-modal-topic]", modal).forEach((el) => {
      if (el.tagName === "INPUT") {
        el.value = topic && label ? `${label}: ${topic}` : topic;
        return;
      }
      el.textContent = topic;
      el.hidden = !topic;
      if (label) {
        el.dataset.label = label;
      } else {
        delete el.dataset.label;
      }
    });
  };

  const openModal = (type) => {
    closeMobileMenu?.();

    modals.forEach((m) => {
      m.classList.remove("open");
      m.style.removeProperty("transform");
    });

    const modal = getModalByType(type);
    if (!modal) return;

    modal.classList.add("open");
    showWrapper();

    if (window.gsap) {
      window.gsap.fromTo(modal, { y: -100 }, { y: 0, duration: 0.5, ease: "power3.out" });
    }
  };

  const closeCurrentModal = () => {
    const current = modals.find((m) => m.classList.contains("open"));

    const finish = () => {
      if (current) current.classList.remove("open");
      hideWrapper();
    };

    if (current && window.gsap) {
      window.gsap.to(current, {
        y: -100,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          current.style.removeProperty("transform");
          finish();
        },
      });
    } else {
      finish();
    }
  };

  $$(".modal-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const type = btn.dataset.type;
      if (!type) return;

      const modal = getModalByType(type);
      fillFromCard(modal, btn);
      fillTopic(modal, btn);
      openModal(type);
    });
  });

  wrapper.addEventListener("click", (e) => {
    if (
      e.target === wrapper ||
      e.target.closest(".modal__close") ||
      e.target.closest("[data-modal-close]")
    ) closeCurrentModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wrapper.style.pointerEvents === "auto") closeCurrentModal();
  });

  return { open: openModal, close: closeCurrentModal };
};
