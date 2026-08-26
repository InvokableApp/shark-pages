/* _shared/product/product.js
 *
 * Behaviour for every product page: the tracked buy CTAs, the mobile buy bar, the scroll
 * reveals, the hero parallax and the reading line. Shared, so one push fixes every page.
 *
 * The page's markup supplies:
 *   .sk-prod                       root
 *   data-buy-step="<step-slug>"    the funnel's tracked redirect step
 *   data-buy-url="<bare url>"      fallback when the page is not served inside the funnel
 *   [data-buy]                     every purchase CTA
 *   [data-hero-cta]                the hero CTA the mobile bar watches
 */
(function () {
  var root = document.querySelector(".sk-prod");
  if (!root || root.dataset.skBooted) return;
  root.dataset.skBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 0. purchase CTAs ----------------------------------------------------
  // Every buy button goes to the funnel's REDIRECT step rather than straight to the shop,
  // because a pageview on that step is what fires Fire Lead. The step then forwards to the
  // rep's buy link on its own. Authored sibling-relative so it works under any funnel path;
  // resolved here to an absolute same-funnel URL so a trailing slash cannot shift it.
  // If the page is not being served from inside the funnel (builder preview, a bare page
  // URL), fall back to the buy link itself so the button is never dead.
  (function () {
    var step = root.getAttribute("data-buy-step");
    var buy = root.getAttribute("data-buy-url");
    var btns = root.querySelectorAll("[data-buy]");
    if (!btns.length) return;
    var path = location.pathname.replace(/\/+$/, "");
    var inFunnel = step && path && path.split("/").pop() !== "";
    var href = null;
    if (inFunnel && /\/preview\//.test(path) === false) {
      href = path.replace(/[^\/]*$/, "") + step;
    } else if (buy) {
      href = "https://" + buy.replace(/^https?:\/\//, "");
    }
    if (!href) return;
    for (var b = 0; b < btns.length; b++) btns[b].setAttribute("href", href);
  })();

  // ---- 0b. mobile buy bar --------------------------------------------------
  // Standard on every product page (HOSTED-BLOCKS-SOP §8b). Shipped `hidden` so a dead script
  // cannot leave a permanent bar across the top, and revealed only once the hero CTA has gone
  // past the TOP of the viewport. The `boundingClientRect.top < 0` test is the whole trick: an
  // element that is simply below the fold is also "not intersecting", and without it the bar
  // appears while the reader is still above the hero.
  (function () {
    var bar = root.querySelector(".sk-prod-bar");
    var hero = root.querySelector("[data-hero-cta]");
    if (!bar || !hero) return;
    // The reading-progress line pins to top:0 as well, so on mobile it is measured out of the
    // way of the bar rather than guessed at.
    var place = function () { root.style.setProperty("--sk-bar-h", bar.offsetHeight + "px"); };
    var show = function (on) {
      if (on) { bar.removeAttribute("hidden"); place(); }
      else bar.setAttribute("hidden", "");
    };
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        show(!e.isIntersecting && e.boundingClientRect.top < 0);
      });
    }, { threshold: 0 }).observe(hero);
    window.addEventListener("resize", function () { if (!bar.hasAttribute("hidden")) place(); }, { passive: true });
  })();

  // ---- 1. reveal on scroll -------------------------------------------------
  var targets = root.querySelectorAll("[data-rise],[data-slide]");
  if (reduce || !("IntersectionObserver" in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("sk-prod-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var d = parseInt(e.target.getAttribute("data-delay") || "0", 10);
        setTimeout(function () { e.target.classList.add("sk-prod-in"); }, d * 90);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  // ---- 2. hero parallax + 3. progress bar ---------------------------------
  var shot = root.querySelector("[data-float]");
  var bar = root.querySelector(".sk-prod-prog i");
  var ticking = false;

  function frame() {
    ticking = false;
    if (shot && !reduce) {
      var r = root.getBoundingClientRect();
      // -1 at the top of the block, +1 well past it; keeps the drift small and symmetrical
      var p = Math.max(-1, Math.min(1, -r.top / (window.innerHeight || 1)));
      shot.style.transform = "translate3d(0," + (p * -22).toFixed(2) + "px,0)";
    }
    if (bar) {
      var box = root.getBoundingClientRect();
      var total = box.height - (window.innerHeight || 0);
      var done = total > 0 ? Math.max(0, Math.min(1, -box.top / total)) : 0;
      bar.style.width = (done * 100).toFixed(1) + "%";
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  frame();

  // ---- 4. in-page anchors --------------------------------------------------
  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-scroll-to], a[href^='#']");
    if (!t) return;
    var sel = t.getAttribute("data-scroll-to") || t.getAttribute("href");
    if (!sel || sel === "#") return;
    var dest = root.querySelector(sel);
    if (!dest) return;
    ev.preventDefault();
    dest.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
})();
