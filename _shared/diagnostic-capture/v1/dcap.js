/* _shared/diagnostic-capture/v1/dcap.js
 *
 * Behaviour for the shared diagnostic lander (.sk-dcap). Four small jobs:
 *
 *   1. every CTA opens the page popup
 *   2. scroll reveal for [data-rise]
 *   3. the sticky mobile bar, once the hero CTA has scrolled off the TOP
 *   4. auto-advance the survey's "processing" slide (added 2026-09-09, see §4)
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

  // ── 4. the processing slide has to advance itself ──────────────────────────
  /* ⚠️ THIS USED TO LIVE IN THE SURVEY'S OWN footerHtml AND IT NEVER RAN. The survey doc still
     carries 1,370 bytes of driver at formData.formAction.footerHtml, and it is present in the
     live DOM as a real <script> tag, and `window.__qzProc` is false: GHL injects that footer with
     innerHTML, and innerHTML DOES NOT EXECUTE A SCRIPT TAG. So the "Reading your answers..."
     slide sat forever, for everybody, and the funnel could not be completed. Measured on
     shark-beta.com/b-skin, 2026-09-09: #qz-proc visible, driver absent, next button present.
     (Same trap as HOSTED-BLOCKS-SOP §5 "a hosted block cannot run a third-party script".)

     It lives here instead because THIS file is loaded as a real script element and does run, and
     because one push reaches every account rather than needing a survey write per account.

     ⚠️ IT NO-OPS WITHOUT #qz-proc, which is what makes it safe to add to a published v1. Measured
     across all 8 surveys in both accounts before shipping: the Disruptor quiz has no processing
     slide, so the tick finds nothing and returns on the first line. Two DO have one, Beneve Skin
     Diagnostic and Nueva Fine Tuning, and both were stalled by this same bug, so this fixes the
     Nueva quiz at the same time. That is a deliberate cross-system fix, not a side effect.

     ⚠️ THE FOOTER MUST BE UN-HIDDEN AGAIN. Hiding it for the processing slide and never restoring
     it leaves the SUBMIT button invisible on the contact slide, which is an unsubmittable quiz:
     a worse bug than the one being fixed. show() runs on every tick that is not on the slide. */
  if (!window.__qzProc) {
    window.__qzProc = true;
    var foot = function () { return document.querySelector(".ghl-footer,.ghl-button-bar"); };
    var show = function () { var f = foot(); if (f && f.style.visibility === "hidden") f.style.visibility = ""; };
    var tick = function () {
      requestAnimationFrame(tick);
      var proc = document.querySelector("#qz-proc");
      var onProc = proc && getComputedStyle(proc).display !== "none" && proc.offsetParent !== null;
      if (!onProc) { show(); return; }
      var page = proc.closest(".ghl-page-current") || proc.closest('[class*="slide-no-"]');
      if (!page || page.dataset.qzGo) return;
      page.dataset.qzGo = "1";
      var f = foot(); if (f) f.style.visibility = "hidden";
      setTimeout(function () {
        var b = document.querySelector(".ghl-page-current .ghl-footer-next,.ghl-page-current .ghl-next-button," +
          ".ghl-page-current .ghl-mobile-next,.ghl-footer-next,.ghl-next-button,.ghl-mobile-next");
        if (b) b.click();
        show();
      }, 4000);
    };
    requestAnimationFrame(tick);
  }
})();
