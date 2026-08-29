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
  // Docks at the TOP of the viewport, the house position for every opt-in.
  //
  // REVEALS ON THE FIRST SCROLL, not once the hero CTA has left the viewport (Joe's preference,
  // via Jeff 2026-08-29). It used to watch the hero button with an IntersectionObserver so the
  // page would never show two copies of the same CTA at once; Joe would rather have the bar
  // available immediately and accept that overlap near the top of the page. Anything above ~4px
  // counts as a scroll, which ignores the rubber-band bounce iOS reports at rest.
  //
  // The `hidden` attribute is the PRE-JS state only and gets dropped here on init: a bar that is
  // display:none cannot transition into view, so visibility is carried by .sk-cap-bar-in and the
  // CSS parks the bar at translateY(-100%) until then. The early return below happens BEFORE the
  // attribute comes off, so a page with no bar in its markup is unaffected and a script that dies
  // leaves nothing stuck across the top.
  (function () {
    var bar = root.querySelector(".sk-cap-bar");
    if (!bar) return;
    bar.removeAttribute("hidden");
    var place = function () { root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px"); };
    var on = false, queued = false;
    var sync = function () {
      queued = false;
      var want = (window.pageYOffset || document.documentElement.scrollTop || 0) > 4;
      if (want === on) return;
      on = want;
      bar.classList.toggle("sk-cap-bar-in", on);
      if (on) place();
    };
    var tick = function () { if (!queued) { queued = true; window.requestAnimationFrame(sync); } };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", function () { if (on) place(); }, { passive: true });
    sync();   // a reload can restore a scroll position, so do not assume we start at the top
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
