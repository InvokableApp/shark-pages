/* _shared/capture/v1/capture.js
 *
 * Behaviour for the shared lead-magnet capture page (.sk-cap). One file for every campaign in
 * every system; a page's block.js is a loader stub that appends this.
 *
 * Its whole job is the CTA. The form lives in the GHL page's own POPUP, not in this block, so
 * every button here dispatches the window event GHL ships for exactly this:
 *
 *     window.dispatchEvent(new Event("customWidgetOpenPopup"));
 *
 * That is the ONLY account-agnostic trigger channel (HOSTED-BLOCKS-SOP §7). It takes no argument,
 * so there is no popup id to rewire per install and one block serves every account. Popup ids are
 * `hl_main_popup-<random>`, minted per page, and hardcoding one breaks on the next snapshot.
 *
 * Constraint that comes with it: ONE popup per page. A no-id emit resolves to popupList[0].
 * Custom code does not run in the builder canvas, so test in Preview or published.
 */
(function () {
  var root = document.querySelector(".sk-cap");
  if (!root) return;

  // ── every CTA opens the page popup ────────────────────────────────────────
  // Delegated, so a button added later (or the mobile bar, which is in the DOM at load but
  // hidden) needs no re-binding.
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-sk-open]") : null;
    if (!t || !root.contains(t)) return;
    e.preventDefault();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  });

  // ── mobile CTA bar ────────────────────────────────────────────────────────
  // Shown only once the hero CTA has scrolled off the TOP, so the page never shows two copies
  // of the same button. The boundingClientRect.top < 0 test is what distinguishes "hero is above
  // the viewport" from "hero is below it", i.e. the reader is still above the fold.
  (function () {
    var bar = root.querySelector(".sk-cap-bar");
    var hero = root.querySelector("[data-sk-hero-cta]");
    if (!bar || !hero || !("IntersectionObserver" in window)) return;
    var place = function () { root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px"); };
    var show = function (on) { if (on) { bar.removeAttribute("hidden"); place(); } else bar.setAttribute("hidden", ""); };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { show(!en.isIntersecting && en.boundingClientRect.top < 0); });
    }, { threshold: 0 }).observe(hero);
    window.addEventListener("resize", function () { if (!bar.hasAttribute("hidden")) place(); }, { passive: true });
  })();

  // ── reveal on scroll ──────────────────────────────────────────────────────
  (function () {
    var els = root.querySelectorAll("[data-sk-rev]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("sk-cap-in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("sk-cap-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  })();
})();
