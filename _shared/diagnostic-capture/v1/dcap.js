/* _shared/diagnostic-capture/v1/dcap.js
 *
 * Behaviour for the shared diagnostic lander (.sk-dcap). Three small jobs:
 *
 *   1. every CTA opens the page popup
 *   2. scroll reveal for [data-rise]
 *   3. the sticky mobile bar, once the hero CTA has scrolled off the TOP
 *
 * On (1): the survey lives in the GHL page's own POPUP, not in this block, so every button here
 * dispatches the window event GHL ships for exactly this:
 *
 *     window.dispatchEvent(new Event("customWidgetOpenPopup"));
 *
 * That is the ONLY account-agnostic trigger channel (HOSTED-BLOCKS-SOP §7). It takes no argument,
 * so there is no popup id to rewire per install and one block serves every account. Popup ids are
 * `hl_main_popup-<random>`, minted per page, and hardcoding one breaks on the next snapshot.
 * Constraint that comes with it: ONE popup per page. A no-id emit resolves to popupList[0].
 * Custom code does not run in the builder canvas, so test in Preview or published.
 */
(function () {
  "use strict";
  var root = document.querySelector(".sk-dcap");
  if (!root || root.getAttribute("data-dcap-ready")) return;
  root.setAttribute("data-dcap-ready", "1");
  root.classList.add("sk-dcap-js");

  // ── 1. every CTA opens the page popup ──────────────────────────────────────
  // Delegated, so the mobile bar (in the DOM at load but off-screen) needs no re-binding.
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-sk-open]") : null;
    if (!t || !root.contains(t)) return;
    e.preventDefault();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });

  // ── 2. scroll reveal ───────────────────────────────────────────────────────
  var rise = root.querySelectorAll("[data-rise]");
  Array.prototype.forEach.call(rise, function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--sk-d", d);
  });
  if (!("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(rise, function (el) { el.classList.add("sk-dcap-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("sk-dcap-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(rise, function (el) { io.observe(el); });
  }

  // ── 3. sticky mobile bar ───────────────────────────────────────────────────
  // Shown only once the hero CTA has scrolled off the TOP, so the page never shows two copies of
  // the same button. boundingClientRect.top < 0 is what distinguishes "hero is above the
  // viewport" from "the reader has not reached it yet".
  var bar = root.querySelector(".sk-dcap-bar");
  var hero = root.querySelector("[data-sk-hero-cta]");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var gone = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("sk-dcap-bar-on", gone);
    }, { threshold: 0 }).observe(hero);
  }
})();
