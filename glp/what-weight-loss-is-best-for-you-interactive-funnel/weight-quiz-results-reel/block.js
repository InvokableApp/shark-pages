/* glp/what-weight-loss-is-best-for-you-interactive-funnel/weight-quiz-results-reel — the dock goes to the next step.
 * This step has no form and no DM (the ask is "Get More Info", the /products-info reel), so the phone's dock (drawn by
 * the platform, funnel-native.js) is sent there on a tap or a swipe, the way the Sizzle reel sends its own. Only while
 * the step has no form: with one, form.js owns the dock and opens it as on any opt-in. */
(function () {
  var root = document.querySelector(".rl.rlw");
  if (!root) return;
  var go = (root.querySelector("[data-wq-go]") || {}).getAttribute ? root.querySelector("[data-wq-go]").getAttribute("href") : "/products-info";
  var hasForm = function () { return !!(window.__PF__ && (window.__PF__.form || window.__PF__.survey)); };
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".pfn-dock");
    if (!d || hasForm()) return;
    e.preventDefault();
    location.href = go;
  }, true);
  // a flick past the last screen does what a swipe on the dock does (reel.js calls dock.pfnSwipe)
  var tries = 0;
  (function hook() {
    var d = document.querySelector(".pfn-dock");
    if (!d) { if (tries++ < 40) setTimeout(hook, 250); return; }
    if (!hasForm()) d.pfnSwipe = function () { location.href = go; };
  })();
})();
