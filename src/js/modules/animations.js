import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";

// ======================
// Анимации появления (GSAP + ScrollTrigger)
// data-anim="fade-up | fade | scale | slide-left | slide-right | rise"
// data-anim-delay="0.1" — задержка, с
// data-anim-stagger — дети появляются по очереди; 
// data-anim-stagger=".card" — элементы по селектору внутри
// data-counter — число набирается от 0, суффикс («+») сохраняется; 
// data-counter-delay — задержка, с
// ======================
const EASE = "power3.out";
const DURATION = 0.8;
const STAGGER = 0.1;
const START = "top 85%";

const FROM = {
  "fade-up": () => ({ y: s(30) }),
  fade: () => ({}),
  scale: () => ({ scale: 0.96, y: s(20) }),
  "slide-left": () => ({ x: s(-40) }),
  "slide-right": () => ({ x: s(40) }),
  rise: () => ({ y: s(60) }),
};

const root = document.documentElement;

const show = (targets) => targets.forEach((el) => el.classList.add("is-shown"));

const initHero = () => {
  const hero = $(".hero");
  if (!hero) return;
  const q = (sel) => $$(sel, hero);
  const img = q(".hero__img");

  gsap.timeline({
    defaults: { ease: EASE, duration: DURATION },
    delay: 0.15,
    onStart: () => show(q("[data-anim], .hero__brand")),
  })
    .fromTo(q(".hero__brand"), { opacity: 0, y: s(20) }, { opacity: 1, y: 0, duration: 1 })
    .fromTo(q(".hero__title-line-inner"), { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, stagger: STAGGER, duration: 0.9 }, 0.15)
    .fromTo(q(".hero__text, .hero__btn"), { opacity: 0, y: s(20) }, { opacity: 1, y: 0, stagger: STAGGER, clearProps: "transform" }, "-=0.5")
    .fromTo(q(".hero__stat"), { opacity: 0, x: s(-30) }, { opacity: 1, x: 0, clearProps: "transform" }, "<0.1")
    .fromTo(img, { opacity: 0, scale: 0.92, y: s(30) }, { opacity: 1, scale: 1, y: 0, duration: 1.2 }, 0.25);

  // Лёгкий параллакс картинки
  gsap.to(img, {
    yPercent: 12,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
};

const initReveals = () => {
  $$("[data-anim]").forEach((el) => {
    const from = FROM[el.dataset.anim];
    if (!from) return;

    gsap.fromTo(el, { opacity: 0, ...from() }, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: DURATION,
      ease: EASE,
      delay: parseFloat(el.dataset.animDelay) || 0,
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: START, once: true },
      onStart: () => show([el]),
    });
  });
};

const initStagger = () => {
  $$("[data-anim-stagger]").forEach((parent) => {
    const sel = parent.dataset.animStagger;
    const items = sel ? $$(sel, parent) : Array.from(parent.children);
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: s(30) });
    ScrollTrigger.batch(items, {
      start: START,
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DURATION,
        ease: EASE,
        stagger: STAGGER,
        clearProps: "transform",
      }),
    });
  });
};

const initCounters = () => {
  const restores = [];

  $$("[data-counter]").forEach((el) => {
    const final = el.textContent.trim();
    const match = final.match(/^(\d+)(.*)$/);
    if (!match) return;
    const [, num, suffix] = match;
    const original = el.innerHTML;

    const out = document.createElement("span");
    out.setAttribute("aria-hidden", "true");
    out.textContent = `0${suffix}`;
    const sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = final;
    el.replaceChildren(out, sr);

    const state = { value: 0 };
    gsap.to(state, {
      value: Number(num),
      duration: 1.6,
      ease: "power2.out",
      delay: parseFloat(el.dataset.counterDelay) || 0,
      onUpdate: () => { out.textContent = `${Math.round(state.value)}${suffix}`; },
      scrollTrigger: { trigger: el, start: START, once: true },
    });

    restores.push(() => { el.innerHTML = original; });
  });

  return () => restores.forEach((restore) => restore());
};

export const initAnimations = () => {
  root.classList.add("anim-ready");

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    root.classList.remove("has-anim");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    root.classList.add("has-anim");
    initHero();
    initReveals();
    initStagger();
    const restoreCounters = initCounters();

    return () => {
      restoreCounters();
      root.classList.remove("has-anim");
    };
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.classList.remove("has-anim");
};
