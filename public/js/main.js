/** ヘッダースクロール・モバイルナビ・スクロールアニメーション */

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
