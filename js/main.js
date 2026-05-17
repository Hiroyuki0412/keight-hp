/** ヘッダースクロール・モバイルナビ・LINEリンク・スクロールアニメーション */

/** LINE友だち追加URLをボタン・QRに反映 */
function applyLineLinks() {
  const url = window.SITE_CONFIG?.LINE_ADD_FRIEND_URL;
  if (!url || url.includes("placeholder")) {
    console.warn(
      "[エイト薬局] LINE URL未設定です。npm run line:url を実行するか .env に VITE_LINE_ADD_FRIEND_URL を設定してください。"
    );
    return;
  }

  document.querySelectorAll("[data-line-link]").forEach((el) => {
    el.setAttribute("href", url);
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  const qr = document.getElementById("line-qr");
  if (qr) {
    const encoded = encodeURIComponent(url);
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
    qr.alt = "エイト薬局 LINE公式アカウント QRコード";
  }
}

applyLineLinks();

/** 地図：座標にラベルを固定表示（操作不可） */
let accessLeafletMap = null;

function buildMapBadgeHtml(label, mapsUrl) {
  return `
    <a class="access-card__map-badge" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="${label}をGoogleマップで開く">
      <span class="access-card__map-badge-pin" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
      </span>
      <span class="access-card__map-badge-text">${label}</span>
    </a>
  `;
}

function applyMapEmbed() {
  const mapCfg = window.SITE_CONFIG?.MAP;
  const container = document.getElementById("access-map");
  if (!mapCfg || !container || typeof L === "undefined") return;

  const { lat, lng, label, address } = mapCfg;
  const zoom = mapCfg.zoom ?? 18;
  const query = encodeURIComponent(`${label} ${address}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  if (accessLeafletMap) {
    accessLeafletMap.setView([lat, lng], zoom);
    return;
  }

  const map = L.map(container, {
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomControl: false,
    attributionControl: true,
  }).setView([lat, lng], zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const icon = L.divIcon({
    className: "access-map-marker-icon",
    html: buildMapBadgeHtml(label, mapsUrl),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });

  L.marker([lat, lng], { icon, interactive: true }).addTo(map);
  accessLeafletMap = map;

  requestAnimationFrame(() => map.invalidateSize());
  window.addEventListener("resize", () => map.invalidateSize());
}

applyMapEmbed();

const header = document.getElementById("header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");

/* スクロールでヘッダーにガラス効果 */
function onScroll() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* モバイルメニュー */
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navToggle.setAttribute("aria-label", open ? "メニューを開く" : "メニューを閉じる");
    siteNav.classList.toggle("is-open", !open);
  });

  siteNav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "メニューを開く");
      siteNav.classList.remove("is-open");
    });
  });
}

/* スムーズスクロール */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = header ? header.offsetHeight + 12 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* スクロール表示アニメーション */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* サービス紹介：順番に表示→揃ったら保持→一緒に消える */
function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function initServiceSequences() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-service-sequence]").forEach((root) => {
    const texts = [...root.querySelectorAll(".service-showcase__text")];
    if (!texts.length) return;

    const stepDelay = 2200;
    const holdDelay = 3200;
    const fadeDelay = 900;
    let paused = false;

    async function delay(ms) {
      const end = Date.now() + ms;
      while (Date.now() < end) {
        if (paused) await wait(150);
        else await wait(Math.min(150, end - Date.now()));
      }
    }

    async function runLoop() {
      if (reducedMotion) {
        texts.forEach((t) => t.classList.add("is-visible"));
        return;
      }

      while (true) {
        texts.forEach((t) => t.classList.remove("is-visible"));

        for (const text of texts) {
          await delay(stepDelay);
          text.classList.add("is-visible");
        }

        await delay(holdDelay);
        texts.forEach((t) => t.classList.remove("is-visible"));
        await delay(fadeDelay);
      }
    }

    root.addEventListener("mouseenter", () => {
      paused = true;
    });
    root.addEventListener("mouseleave", () => {
      paused = false;
    });

    runLoop();
  });
}

initServiceSequences();

/* FAQ：1つだけ開く（アコーディオン） */
document.querySelectorAll("[data-faq-accordion]").forEach((root) => {
  const items = root.querySelectorAll(".faq-item");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
});
