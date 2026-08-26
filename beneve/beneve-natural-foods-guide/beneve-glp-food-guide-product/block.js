/* beneve/beneve-natural-foods-guide/beneve-glp-food-guide-product
 *
 * Scroll behaviour only. No third-party libraries: a hosted block is injected with innerHTML,
 * so a <script src> inside it never executes (HOSTED-BLOCKS-SOP). Everything here is vanilla and
 * runs off the loader's own script tag.
 *
 *  1. reveal    IntersectionObserver, staggered by data-delay
 *  2. float     gentle parallax on the hero jar, rAF-throttled
 *  3. progress  the reading bar
 *  4. anchors   smooth scroll for the in-page links
 *
 * Everything degrades to "just visible" if IntersectionObserver is missing or the viewer asked
 * for reduced motion, which is also what the CSS does on its own.
 */
(function () {
  var root = document.querySelector(".sk-bnv-gut");
  if (!root || root.dataset.skBooted) return;
  root.dataset.skBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. reveal on scroll -------------------------------------------------
  var targets = root.querySelectorAll("[data-rise],[data-slide]");
  if (reduce || !("IntersectionObserver" in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("sk-bnv-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var d = parseInt(e.target.getAttribute("data-delay") || "0", 10);
        setTimeout(function () { e.target.classList.add("sk-bnv-in"); }, d * 90);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  // ---- 2. hero parallax + 3. progress bar ---------------------------------
  var shot = root.querySelector("[data-float]");
  var bar = root.querySelector(".sk-bnv-prog i");
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
