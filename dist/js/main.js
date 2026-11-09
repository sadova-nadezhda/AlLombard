(() => {
  // src/js/modules/helpers.js
  var $ = (sel, root2 = document) => root2.querySelector(sel);
  var $$ = (sel, root2 = document) => Array.from(root2.querySelectorAll(sel));
  var debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // src/js/modules/multiplier.js
  var multiplier = 1;
  var getWidthMultiplier = () => {
    const w = window.innerWidth;
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    if (w <= 767) return minSide / 375;
    if (w <= 1024) return minSide / 768;
    return window.innerWidth / 1440;
  };
  var updateMultiplier = () => {
    multiplier = getWidthMultiplier();
  };
  var s = (value) => value * multiplier;

  // src/js/modules/layout.js
  var refreshLenis = () => {
    if (window.lenis && typeof window.lenis.resize === "function") window.lenis.resize();
  };
  var layoutFrozen = () => document.documentElement.classList.contains("is-loading") || document.body.classList.contains("no-scroll");
  var layoutPending = false;
  var refreshLayout = () => {
    if (layoutFrozen()) {
      layoutPending = true;
      return;
    }
    layoutPending = false;
    refreshLenis();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  };
  var flushLayout = () => {
    if (layoutPending) requestAnimationFrame(refreshLayout);
  };

  // src/js/modules/lenis.js
  var initLenis = () => {
    if (typeof Lenis === "undefined") return null;
    const useGsapTicker = typeof gsap !== "undefined";
    const lenis = new Lenis({
      autoRaf: !useGsapTicker,
      anchors: { offset: -Math.round(s(120)) }
    });
    window.lenis = lenis;
    document.documentElement.style.scrollBehavior = "auto";
    if (useGsapTicker) {
      gsap.ticker.add((time) => lenis.raf(time * 1e3));
      gsap.ticker.lagSmoothing(0);
      if (typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
      }
    }
    return lenis;
  };

  // src/js/modules/scroll-lock.js
  var createScrollLock = (lenis) => {
    const locks = /* @__PURE__ */ new Set();
    const apply = () => {
      var _a, _b;
      if (locks.size) {
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty("--scrollbar-width", `${scrollbar}px`);
        document.body.classList.add("no-scroll");
        (_a = lenis == null ? void 0 : lenis.stop) == null ? void 0 : _a.call(lenis);
      } else {
        document.body.classList.remove("no-scroll");
        document.documentElement.style.setProperty("--scrollbar-width", "0px");
        (_b = lenis == null ? void 0 : lenis.start) == null ? void 0 : _b.call(lenis);
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
      has: (key) => locks.has(key)
    };
  };

  // src/js/modules/modals.js
  var initModals = ({ scrollLock, closeMobileMenu } = {}) => {
    const wrapper = $(".modals");
    if (!wrapper) return;
    const modals = $$(".modal", wrapper);
    const getModalByType = (type) => wrapper.querySelector(`.modal[data-type="${type}"]`);
    const showWrapper = () => {
      var _a;
      wrapper.style.opacity = 1;
      wrapper.style.pointerEvents = "auto";
      (_a = scrollLock == null ? void 0 : scrollLock.lock) == null ? void 0 : _a.call(scrollLock, "modal");
    };
    const hideWrapper = () => {
      var _a;
      wrapper.style.opacity = 0;
      wrapper.style.pointerEvents = "none";
      (_a = scrollLock == null ? void 0 : scrollLock.unlock) == null ? void 0 : _a.call(scrollLock, "modal");
    };
    const fillFromCard = (modal, btn) => {
      var _a, _b, _c, _d;
      const card = btn.closest("[data-modal-source]");
      if (!modal || !card) return;
      const modalImg = $(".modal__img img", modal);
      const cardImg = $("[data-modal-img]", card);
      if (modalImg && cardImg) {
        modalImg.src = cardImg.src;
        modalImg.alt = cardImg.alt;
      }
      const title = $(".modal__title", modal);
      if (title) title.textContent = (_b = (_a = $("[data-modal-title]", card)) == null ? void 0 : _a.textContent.trim()) != null ? _b : "";
      const text = $(".modal__text", modal);
      if (text) text.innerHTML = (_d = (_c = $("[data-modal-text]", card)) == null ? void 0 : _c.innerHTML) != null ? _d : "";
    };
    const fillTopic = (modal, btn) => {
      var _a, _b, _c;
      if (!modal) return;
      const source = btn.closest(".modal");
      const topic = source ? (_b = (_a = $(".modal__title", source)) == null ? void 0 : _a.textContent.trim()) != null ? _b : "" : "";
      const label = (_c = source == null ? void 0 : source.dataset.topicLabel) != null ? _c : "";
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
      closeMobileMenu == null ? void 0 : closeMobileMenu();
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
          }
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
      if (e.target === wrapper || e.target.closest(".modal__close") || e.target.closest("[data-modal-close]")) closeCurrentModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wrapper.style.pointerEvents === "auto") closeCurrentModal();
    });
    return { open: openModal, close: closeCurrentModal };
  };

  // src/js/modules/phone-mask.js
  var initPhoneMask = () => {
    const inputs = $$('input[type="tel"]');
    if (!inputs.length) return;
    const format = (value, matrix) => {
      const prefix = matrix.replace(/\D/g, "");
      const slots = (matrix.match(/[_\d]/g) || []).length;
      const free = slots - prefix.length;
      const head = matrix.slice(0, matrix.indexOf("_"));
      let body = value.startsWith(head) ? value.slice(head.length).replace(/\D/g, "") : value.replace(/\D/g, "");
      if (prefix === "7" && body.startsWith("8")) {
        body = body.slice(1);
      } else if (body.length > free && body.startsWith(prefix)) {
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
        var _a;
        const entered = input.value.replace(/\D/g, "");
        if (((_a = e.inputType) == null ? void 0 : _a.startsWith("delete")) && entered.length <= prefix.length) {
          input.value = "";
          return;
        }
        input.value = format(input.value, matrix);
      });
    });
  };

  // src/js/modules/menu.js
  var initMenu = ({ scrollLock } = {}) => {
    const header = $(".header");
    const burger = header && $(".header__burger", header);
    if (!header || !burger) return;
    const isOpen = () => header.classList.contains("is-open");
    const setOpen = (open) => {
      var _a, _b;
      header.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E" : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E");
      if (open) {
        (_a = scrollLock == null ? void 0 : scrollLock.lock) == null ? void 0 : _a.call(scrollLock, "menu");
      } else {
        (_b = scrollLock == null ? void 0 : scrollLock.unlock) == null ? void 0 : _b.call(scrollLock, "menu");
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

  // src/js/modules/dropdown.js
  var initDropdowns = () => {
    const dropdowns = $$("[data-dropdown]");
    if (!dropdowns.length) return;
    const canHover = window.matchMedia("(hover: hover)");
    const items = dropdowns.map((root2) => {
      const toggle = root2.querySelector("[data-dropdown-toggle]");
      let timer;
      const set = (open2) => {
        clearTimeout(timer);
        root2.classList.toggle("is-open", open2);
        toggle == null ? void 0 : toggle.setAttribute("aria-expanded", String(open2));
      };
      const open = () => {
        items.forEach((item) => item.root !== root2 && item.set(false));
        set(true);
      };
      const isOpen = () => root2.classList.contains("is-open");
      root2.addEventListener("mouseenter", () => {
        if (canHover.matches) open();
      });
      root2.addEventListener("mouseleave", () => {
        if (!canHover.matches) return;
        clearTimeout(timer);
        timer = setTimeout(() => set(false), 150);
      });
      toggle == null ? void 0 : toggle.addEventListener("click", () => isOpen() ? set(false) : open());
      root2.addEventListener("focusout", (e) => {
        if (!root2.contains(e.relatedTarget)) set(false);
      });
      root2.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) {
          set(false);
          toggle == null ? void 0 : toggle.focus();
        }
      });
      return { root: root2, set };
    });
    document.addEventListener("click", (e) => {
      items.forEach(({ root: root2, set }) => {
        if (!root2.contains(e.target)) set(false);
      });
    });
  };

  // src/js/modules/autoplay.js
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var getAutoplayOptions = () => ({
    rewind: true,
    autoplay: reducedMotion.matches ? false : {
      delay: 4e3,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    }
  });
  var bindAutoplay = (swiper) => {
    var _a;
    if (!((_a = swiper.params.autoplay) == null ? void 0 : _a.enabled)) return () => {
    };
    const root2 = swiper.el;
    let visible = false;
    let focused = false;
    const sync = () => {
      if (visible && !focused) swiper.autoplay.start();
      else swiper.autoplay.stop();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(root2);
    const onFocusIn = () => {
      focused = true;
      sync();
    };
    const onFocusOut = (e) => {
      if (root2.contains(e.relatedTarget)) return;
      focused = false;
      sync();
    };
    root2.addEventListener("focusin", onFocusIn);
    root2.addEventListener("focusout", onFocusOut);
    return () => {
      observer.disconnect();
      root2.removeEventListener("focusin", onFocusIn);
      root2.removeEventListener("focusout", onFocusOut);
    };
  };

  // src/js/modules/mobile-slider.js
  var initMobileSliders = () => {
    const roots = $$("[data-mobile-slider]");
    if (!roots.length || typeof Swiper === "undefined") return null;
    const mq = window.matchMedia("(max-width: 767px)");
    const items = roots.map((root2) => ({
      root: root2,
      gap: Number(root2.dataset.sliderGap) || 0,
      swiper: null,
      unbindAutoplay: null
    }));
    const toggle = () => {
      items.forEach((item) => {
        if (mq.matches && !item.swiper) {
          item.swiper = new Swiper(item.root, {
            ...getAutoplayOptions(),
            slidesPerView: "auto",
            spaceBetween: s(item.gap),
            watchSlidesProgress: true
          });
          item.unbindAutoplay = bindAutoplay(item.swiper);
        } else if (!mq.matches && item.swiper) {
          item.unbindAutoplay();
          item.swiper.destroy(true, true);
          item.swiper = null;
        }
      });
    };
    const update = () => {
      items.forEach(({ swiper, gap }) => {
        if (!swiper) return;
        swiper.params.spaceBetween = s(gap);
        swiper.update();
      });
    };
    toggle();
    mq.addEventListener("change", toggle);
    return { update };
  };

  // src/js/modules/calculator.js
  var formatMoney = (value) => `${Math.round(value).toLocaleString("ru-RU")}\xA0\u20B8`;
  var formatDays = (value) => `${value}\xA0\u0434.`;
  var pluralDays = (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "\u0434\u0435\u043D\u044C";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "\u0434\u043D\u044F";
    return "\u0434\u043D\u0435\u0439";
  };
  var initCalculator = () => {
    const root2 = $("[data-calculator]");
    if (!root2) return;
    const type = $("[data-calculator-type]", root2);
    const amount = $("[data-calculator-amount]", root2);
    const days = $("[data-calculator-days]", root2);
    const range = days.closest(".calculator__range");
    const daysCurrent = $("[data-calculator-days-current]", root2);
    const daysMax = $("[data-calculator-days-max]", root2);
    const out = (name) => $(`[data-calculator-out="${name}"]`, root2);
    const rate = parseFloat(root2.dataset.rate) || 0;
    out("rate").textContent = `${String(rate).replace(".", ",")}%`;
    const getAmount = () => Number(amount.value.replace(/\D/g, "")) || 0;
    const updateRange = () => {
      const min = Number(days.min);
      const max = Number(days.max);
      const value = Number(days.value);
      range.style.setProperty("--progress", (value - min) / (max - min));
      daysCurrent.textContent = formatDays(value);
      days.setAttribute("aria-valuetext", `${value} ${pluralDays(value)}`);
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
      const date = /* @__PURE__ */ new Date();
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
    type.addEventListener("change", () => {
      var _a;
      const max = ((_a = type.selectedOptions[0]) == null ? void 0 : _a.dataset.maxDays) || 30;
      days.max = max;
      if (Number(days.value) > max) days.value = max;
      daysMax.textContent = formatDays(max);
      update();
    });
    amount.addEventListener("input", () => {
      const sum = getAmount();
      amount.value = sum ? sum.toLocaleString("ru-RU") : "";
      calculate();
    });
    days.addEventListener("input", update);
    update();
  };

  // src/js/modules/slider.js
  var presets = {
    // Два ряда (Swiper Grid), заполнение по колонкам
    partners: {
      gap: [8, 20],
      options: {
        slidesPerView: 1.2,
        grid: { rows: 2, fill: "column" },
        breakpoints: {
          768: { slidesPerView: 3, grid: { rows: 2, fill: "column" } },
          1025: { slidesPerView: 4, grid: { rows: 2, fill: "column" } }
        }
      }
    },
    reviews: {
      gap: [8, 20],
      options: {
        slidesPerView: "auto",
        breakpoints: {
          768: { slidesPerView: 2 },
          1025: { slidesPerView: 3 }
        }
      }
    },
    // Ширина слайдов — по пропорциям картинок, задаётся в CSS
    awards: {
      gap: [8, 20],
      options: {
        slidesPerView: "auto"
      }
    }
  };
  var initSliders = () => {
    const roots = $$("[data-slider]").filter((root2) => presets[root2.dataset.slider]);
    if (!roots.length || typeof Swiper === "undefined") return null;
    const mq = window.matchMedia("(max-width: 767px)");
    const getGap = ([mobile, other]) => s(mq.matches ? mobile : other);
    const sliders = roots.map((root2) => {
      const { gap, options } = presets[root2.dataset.slider];
      const section = root2.closest("section");
      const swiper = new Swiper(root2, {
        ...getAutoplayOptions(),
        ...options,
        spaceBetween: getGap(gap),
        navigation: {
          prevEl: section == null ? void 0 : section.querySelector(".slider-btn--prev"),
          nextEl: section == null ? void 0 : section.querySelector(".slider-btn--next")
        }
      });
      bindAutoplay(swiper);
      return { swiper, gap };
    });
    const update = () => {
      sliders.forEach(({ swiper, gap }) => {
        swiper.params.spaceBetween = getGap(gap);
        swiper.update();
      });
    };
    return { update };
  };

  // src/js/modules/contacts-map.js
  var ZOOM_ADDRESS = 15;
  var TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  var GIS_URL = "https://2gis.kz";
  var initContactsMap = () => {
    const section = $("[data-map-section]");
    if (!section) return;
    const select = $("[data-map-city-select]", section);
    const lists = $$("[data-map-city]", section);
    const container = $("[data-map]", section);
    const pinTemplate = $("[data-map-pin]", section);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let map = null;
    let markers = [];
    let popup = null;
    const getCoords = (btn) => {
      const [lng, lat] = btn.dataset.coords.split(",").map(Number);
      return [lat, lng];
    };
    const getName = (btn) => $(".contacts-map__address-name", btn).textContent.trim();
    const getLink = (btn) => {
      const { link } = btn.dataset;
      if (link && link !== "#") return link;
      return `${GIS_URL}/${select.value}/search/${encodeURIComponent(getName(btn))}`;
    };
    const htmlMarker = (coords, html, options = {}) => L.marker(coords, {
      icon: L.divIcon({ html, className: "contacts-map__marker", iconSize: null }),
      keyboard: false,
      ...options
    }).addTo(map);
    const moveTo = (coords, zoom) => {
      if (reduceMotion.matches) map.setView(coords, zoom, { animate: false });
      else map.flyTo(coords, zoom, { duration: 0.6 });
    };
    const currentList = () => lists.find((list) => list.dataset.mapCity === select.value);
    const currentButtons = () => $$("[data-map-address]", currentList());
    const closePopup = () => {
      popup == null ? void 0 : popup.remove();
      popup = null;
    };
    const openPopup = (btn) => {
      closePopup();
      const el = document.createElement("div");
      el.className = "contacts-map__popup";
      const title = document.createElement("p");
      title.className = "contacts-map__popup-title";
      title.textContent = getName(btn);
      const link = document.createElement("a");
      link.className = "contacts-map__popup-link";
      link.href = getLink(btn);
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0432 2gis";
      el.append(title, link);
      L.DomEvent.disableClickPropagation(el);
      popup = htmlMarker(getCoords(btn), el, { zIndexOffset: 1e3 });
    };
    const revealInList = (btn) => {
      const list = currentList();
      const listRect = list.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      if (btnRect.top >= listRect.top && btnRect.bottom <= listRect.bottom) return;
      list.scrollTop += btnRect.top - listRect.top - (list.clientHeight - btnRect.height) / 2;
    };
    const activate = (btn, { fromMap = false } = {}) => {
      currentButtons().forEach((item) => item.setAttribute("aria-pressed", String(item === btn)));
      markers.forEach(({ btn: item, pin }) => pin.classList.toggle("is-active", item === btn));
      if (fromMap) revealInList(btn);
      if (!map) return;
      moveTo(getCoords(btn), ZOOM_ADDRESS);
      openPopup(btn);
    };
    const fitCity = () => {
      const points = currentButtons().map(getCoords);
      if (!map || !points.length) return;
      if (points.length === 1) {
        moveTo(points[0], ZOOM_ADDRESS);
        return;
      }
      map.fitBounds(points, {
        paddingTopLeft: [s(40), s(80)],
        paddingBottomRight: [s(40), s(40)],
        animate: !reduceMotion.matches
      });
    };
    const renderMarkers = () => {
      markers.forEach(({ marker }) => marker.remove());
      markers = currentButtons().map((btn) => {
        const pin = pinTemplate.content.firstElementChild.cloneNode(true);
        pin.setAttribute("aria-label", `${getName(btn)} \u2014 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u043A\u0430\u0440\u0442\u0435`);
        pin.addEventListener("click", () => activate(btn, { fromMap: true }));
        const marker = htmlMarker(getCoords(btn), pin);
        return { btn, pin, marker };
      });
    };
    const showCity = () => {
      lists.forEach((list) => list.hidden = list.dataset.mapCity !== select.value);
      currentButtons().forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      closePopup();
      if (!map) return;
      renderMarkers();
      fitCity();
    };
    const initMap = () => {
      const [first] = currentButtons().map(getCoords);
      map = L.map(container, { center: first, zoom: 12, zoomControl: false });
      map.attributionControl.setPrefix(false);
      L.tileLayer(TILES_URL, { attribution: TILES_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      container.setAttribute("data-lenis-prevent", "");
      renderMarkers();
      fitCity();
    };
    showCity();
    select.addEventListener("change", showCity);
    lists.forEach((list) => {
      list.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-map-address]");
        if (btn) activate(btn);
      });
    });
    if (!container || typeof L === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      initMap();
    }, { rootMargin: "300px" });
    observer.observe(container);
  };

  // src/js/modules/animations.js
  var EASE = "power3.out";
  var DURATION = 0.8;
  var STAGGER = 0.1;
  var START = "top 85%";
  var FROM = {
    "fade-up": () => ({ y: s(30) }),
    fade: () => ({}),
    scale: () => ({ scale: 0.96, y: s(20) }),
    "slide-left": () => ({ x: s(-40) }),
    "slide-right": () => ({ x: s(40) }),
    rise: () => ({ y: s(60) })
  };
  var root = document.documentElement;
  var show = (targets) => targets.forEach((el) => el.classList.add("is-shown"));
  var initHero = () => {
    const hero = $(".hero");
    if (!hero) return;
    const q = (sel) => $$(sel, hero);
    const img = q(".hero__img");
    gsap.timeline({
      defaults: { ease: EASE, duration: DURATION },
      delay: 0.15,
      onStart: () => show(q("[data-anim], .hero__brand"))
    }).fromTo(q(".hero__brand"), { opacity: 0, y: s(20) }, { opacity: 1, y: 0, duration: 1 }).fromTo(q(".hero__title-line-inner"), { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, stagger: STAGGER, duration: 0.9 }, 0.15).fromTo(q(".hero__text, .hero__btn"), { opacity: 0, y: s(20) }, { opacity: 1, y: 0, stagger: STAGGER, clearProps: "transform" }, "-=0.5").fromTo(q(".hero__stat"), { opacity: 0, x: s(-30) }, { opacity: 1, x: 0, clearProps: "transform" }, "<0.1").fromTo(img, { opacity: 0, scale: 0.92, y: s(30) }, { opacity: 1, scale: 1, y: 0, duration: 1.2 }, 0.25);
    gsap.to(img, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
  };
  var initReveals = () => {
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
        onStart: () => show([el])
      });
    });
  };
  var initStagger = () => {
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
          clearProps: "transform"
        })
      });
    });
  };
  var initCounters = () => {
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
        onUpdate: () => {
          out.textContent = `${Math.round(state.value)}${suffix}`;
        },
        scrollTrigger: { trigger: el, start: START, once: true }
      });
      restores.push(() => {
        el.innerHTML = original;
      });
    });
    return () => restores.forEach((restore) => restore());
  };
  var initAnimations = () => {
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

  // src/js/main.js
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
        { passive: true }
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
      const modals = initModals({ scrollLock, closeMobileMenu: menu == null ? void 0 : menu.close });
      initAnimations();
      refreshLayout();
      window.addEventListener("resize", debounce(() => {
        updateMultiplier();
        mobileSliders == null ? void 0 : mobileSliders.update();
        sliders == null ? void 0 : sliders.update();
        refreshLayout();
      }, 150));
    });
  })();
})();
//# sourceMappingURL=main.js.map
