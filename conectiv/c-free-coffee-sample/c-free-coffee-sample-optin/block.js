/* conectiv / c-free-coffee-sample / c-free-coffee-sample-optin
 *
 * Loads the shared product-page engine (reveals, hero parallax, reading line, mobile bar) and
 * adds the two things an opt-in lander needs that a product page does not:
 *
 *   1. data-optin CTAs open the page's NATIVE GHL popup form, via GHL's own no-argument window
 *      event. No popup id is ever named, so one block serves every account and it survives a
 *      snapshot install. (HOSTED-BLOCKS-SOP section 7.)
 *   2. the hero stat numbers count up when they scroll into view.
 *
 * The click handler is bound in the CAPTURE phase on the same root the shared engine binds to.
 * Both listeners sit on that element, and capture always runs before bubble on the same node,
 * so this one wins and the shared anchor-scroll never sees the click. The href="#claim" stays
 * on the markup on purpose: if this script fails to load, the button still moves the reader to
 * the closing section instead of being dead.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });

  var root = document.querySelector(".sk-prod-ctv");
  if (!root || root.dataset.ctvBooted) return;
  root.dataset.ctvBooted = "1";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. every CTA opens the native popup form ----------------------------
  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-optin]");
    if (!t) return;
    ev.preventDefault();
    ev.stopPropagation();
    window.dispatchEvent(new Event("customWidgetOpenPopup"));
  }, true);

  // ---- 2. stat counters ----------------------------------------------------
  var nums = root.querySelectorAll("[data-count]");
  if (!nums.length) return;
  if (reduce || !("IntersectionObserver" in window)) return;   // markup already holds the value

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target;
      var end = parseInt(el.getAttribute("data-count"), 10) || 0;
      var t0 = null;
      var DUR = 900;
      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        // ease-out so it decelerates onto the final number rather than snapping
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = "0";
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  for (var i = 0; i < nums.length; i++) io.observe(nums[i]);
})();
