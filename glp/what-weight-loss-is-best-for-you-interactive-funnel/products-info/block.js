/* glp / what-weight-loss-is-best-for-you-interactive-funnel / products-info
 *
 * Three jobs, and deliberately nothing else. The scroll reveals, the count-ups and the
 * hero parallax are all declarative and come from _shared/shark-reveal/v1 via the
 * data-sk-* attributes in block.html, so they are not re-implemented here.
 *
 *   1. EVERY CTA OPENS THE PAGE'S NATIVE GHL POPUP. This is the whole conversion: on the
 *      builder page each of the nine buttons was action:"openPopup" pointed at
 *      hl_main_popup-tK_iVCGWYG. That id is minted per page and is DIFFERENT in every
 *      account, so it is never named here. GHL's own no-argument window event resolves to
 *      the page's first popup, which makes one block serve every account and survive a
 *      snapshot install. (HOSTED-BLOCKS-SOP §7.)
 *
 *      ⚠️ The §7 one-popup-per-page constraint applies to this page. It carries exactly one
 *      (popups:1, popupsList:1 in the page document, measured 2026-09-24). If a second is
 *      ever added in the builder, every button here silently starts opening the wrong one.
 *
 *   2. THE VIDEO IS A CLICK-TO-LOAD FACADE. The source page embedded a 1080p self-hosted
 *      .mov directly, which the browser starts fetching on page load. It is a poster image
 *      until tapped now, and the same behaviour the how-to pages use for their walkthroughs.
 *
 *   3. THE READING LINE tracks scroll depth through the block.
 *
 * The CTA handler binds in the CAPTURE phase so it runs before any native GHL listener on
 * an ancestor, and the jump-nav anchors are left to the browser.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";

  ["_shared/shark-reveal/v1/shark-reveal.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var root = document.querySelector(".sk-glp-info");
  if (!root || root.dataset.giBooted) return;
  root.dataset.giBooted = "1";

  // ---- 1. every CTA opens the native popup -------------------------------------------
  root.addEventListener("click", function (ev) {
    var t = ev.target.closest && ev.target.closest("[data-optin]");
    if (!t) return;
    ev.preventDefault();
    ev.stopPropagation();
    try {
      window.dispatchEvent(new Event("customWidgetOpenPopup"));
    } catch (e) {
      // Nothing to fall back to that is account-safe: a popup id is not portable. Move the
      // reader to the FAQ band instead, which is where #claim lives, so the tap is never dead.
      var claim = document.getElementById("claim");
      if (claim) claim.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, true);

  // ---- 2. video facade ----------------------------------------------------------------
  var facade = root.querySelector(".sk-glp-video-facade");
  if (facade) {
    facade.addEventListener("click", function () {
      var src = facade.getAttribute("data-video");
      if (!src) return;
      var v = document.createElement("video");
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");     // iOS Safari wants the attribute, not just the prop
      v.preload = "auto";
      facade.parentNode.replaceChild(v, facade);
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked; controls are showing */ });
    }, { once: true });
  }

  // ---- 3. reading line ----------------------------------------------------------------
  var bar = root.querySelector(".sk-glp-prog i");
  if (bar) {
    var tick = false;
    var paint = function () {
      tick = false;
      var r = root.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var pct = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.width = (pct * 100).toFixed(2) + "%";
    };
    var onScroll = function () {
      if (tick) return;
      tick = true;
      window.requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();
  }
})();
