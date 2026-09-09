/* _shared/diagnostic-capture/v1/dcap.js
 *
 * Behaviour for the shared diagnostic lander (.sk-dcap). Three small jobs:
 *
 *   1. every CTA opens the page popup
 *   2. scroll reveal for [data-rise]
 *   3. the sticky CTA bar at the top, revealed on the first scroll (HOSTED-BLOCKS-SOP §8b)
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

  // ── 3. sticky CTA bar ──────────────────────────────────────────────────────
  // HOSTED-BLOCKS-SOP §8b. Reveal on the FIRST SCROLL, not once the hero CTA has left the
  // viewport. The observer version that used to live here is RETIRED, not a variant: it kept the
  // page from ever showing two copies of the button, at the cost of a reader mid-page having no
  // CTA at all. Joe's call, 2026-08-29, is that an available CTA wins and the overlap is fine.
  //
  // Three details that are not decoration. The 4px threshold ignores the rubber-band bounce iOS
  // reports while the page is at rest. The rAF gate plus the `want === on` early return keep the
  // scroll handler off the critical path. And the sync() at the end covers a reload that restores
  // a scroll position partway down the page, where a listener alone would leave the bar hidden
  // until the reader happened to move.
  var bar = root.querySelector(".sk-dcap-bar");
  if (bar) {
    // ⚠️ The bar ships `hidden` so a blocked script leaves no dead button welded across the top.
    // Clearing it is a separate job from showing it: display:none cannot transition, so the
    // attribute is the pre-JS state only and visibility after this is a class.
    bar.removeAttribute("hidden");
    var on = false, queued = false;
    var sync = function () {
      queued = false;
      var want = (window.pageYOffset || document.documentElement.scrollTop || 0) > 4;
      if (want === on) return;
      on = want;
      bar.classList.toggle("sk-dcap-bar-on", on);
      if (on) root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px");
    };
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; window.requestAnimationFrame(sync); }
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (on) root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px");
    }, { passive: true });
    sync();
  }
})();
