import { $, $$ } from "./helpers.js";
import { s } from "./multiplier.js";

const ZOOM_ADDRESS = 15;
const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
// Подпись обязательна по лицензии OpenStreetMap
const TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const GIS_URL = "https://2gis.kz";

// ======================
// Секция «Мы на карте»: [data-map-section]
// Город — select, адреса — [data-map-city] > [data-map-address] с data-coords «долгота,широта»
// Карта — Leaflet (глобальный L) с тайлами OSM; без Leaflet список адресов работает как обычно
// ======================
export const initContactsMap = () => {
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

  // В разметке «долгота,широта», Leaflet ждёт [широта, долгота]
  const getCoords = (btn) => {
    const [lng, lat] = btn.dataset.coords.split(",").map(Number);
    return [lat, lng];
  };
  const getName = (btn) => $(".contacts-map__address-name", btn).textContent.trim();
  // Своя ссылка из data-link или поиск адреса на 2gis.kz в выбранном городе
  const getLink = (btn) => {
    const { link } = btn.dataset;
    if (link && link !== "#") return link;
    return `${GIS_URL}/${select.value}/search/${encodeURIComponent(getName(btn))}`;
  };

  // HTML-маркер без стандартной иконки
  const htmlMarker = (coords, html, options = {}) =>
    L.marker(coords, {
      icon: L.divIcon({ html, className: "contacts-map__marker", iconSize: null }),
      keyboard: false,
      ...options,
    }).addTo(map);

  const moveTo = (coords, zoom) => {
    if (reduceMotion.matches) map.setView(coords, zoom, { animate: false });
    else map.flyTo(coords, zoom, { duration: 0.6 });
  };
  const currentList = () => lists.find((list) => list.dataset.mapCity === select.value);
  const currentButtons = () => $$("[data-map-address]", currentList());

  const closePopup = () => {
    popup?.remove();
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
    link.textContent = "Открыть в 2gis";

    el.append(title, link);
    L.DomEvent.disableClickPropagation(el);
    popup = htmlMarker(getCoords(btn), el, { zIndexOffset: 1000 });
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
      animate: !reduceMotion.matches,
    });
  };

  const renderMarkers = () => {
    markers.forEach(({ marker }) => marker.remove());
    markers = currentButtons().map((btn) => {
      const pin = pinTemplate.content.firstElementChild.cloneNode(true);
      pin.setAttribute("aria-label", `${getName(btn)} — показать на карте`);
      pin.addEventListener("click", () => activate(btn, { fromMap: true }));
      const marker = htmlMarker(getCoords(btn), pin);
      return { btn, pin, marker };
    });
  };

  const showCity = () => {
    lists.forEach((list) => (list.hidden = list.dataset.mapCity !== select.value));
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
    // Колесо над картой масштабирует её, а не прокручивает страницу.
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
