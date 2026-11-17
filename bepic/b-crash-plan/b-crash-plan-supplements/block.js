/* GENERATED from the 3pm-crash campaign's guide/build/web.js by build-web.mjs. Do not edit the block copy by hand.
 *
 * The read-online guides' behaviour. Vanilla, no dependencies: a hosted block is injected as markup, so this must
 * guard every lookup (a throw here takes the page's other scripts down with it).
 *  1. progress  an orange hairline under the sticky nav
 *  2. curve     the hero curve FLATTENS as the reader scrolls (frames built from the PDF's own curve; plan only)
 *  3. motion    headings and numbers slam in as they arrive (skipped when the reader asks for reduced motion)
 *  4. nav       smooth jumps that land below the bar
 *  5. print     a print button on every section tagged data-pf-print="Label"; prints that section alone
 * The merge field in the Download item is filled by the platform as the page is served; nothing here touches it.
 */
(function () {
  "use strict";
  var root = document.querySelector(".sk-cp");
  if (!root || root.getAttribute("data-booted")) return;
  root.setAttribute("data-booted", "1");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1 + 2 */
  var FRAMES = [];
  var spike = root.querySelector("#cp-hero-curve .spike");
  var bar = root.querySelector(".cp-nav-bar i");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var top = root.getBoundingClientRect().top;
      var h = root.offsetHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, -top / h)) : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      if (spike && FRAMES.length && !reduce) {
        var f = Math.min(1, p / 0.55);
        spike.setAttribute("d", FRAMES[Math.round(f * (FRAMES.length - 1))]);
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* 3 */
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("cp-motion");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    root.querySelectorAll("[data-in]").forEach(function (el) { io.observe(el); });
    // anything already on screen at load shows at once
    setTimeout(function () {
      root.querySelectorAll("[data-in]").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    }, 40);
  }

  /* 4 */
  root.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a[href^='#']") : null;
    if (!a) return;
    var dest = root.querySelector(a.getAttribute("href"));
    if (!dest) return;
    ev.preventDefault();
    var nav = root.querySelector(".cp-nav");
    var y = dest.getBoundingClientRect().top + window.pageYOffset - ((nav && nav.offsetHeight) || 0) - 12;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  });

  /* 5 */
  root.querySelectorAll("[data-pf-print]").forEach(function (el) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pf-print";
    b.textContent = el.getAttribute("data-pf-print");
    b.addEventListener("click", function () {
      root.setAttribute("data-printing", "1");
      el.setAttribute("data-print", "1");
      var done = function () { root.removeAttribute("data-printing"); el.removeAttribute("data-print"); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      window.print();
    });
    (el.querySelector(".cp-col") || el).appendChild(b);
  });
})();
