/* glp/natural-glp-pamphlets/_assets/pamphlet.js — the two natural GLP pamphlets' moves, on top of reel.js (which marks
 * the screen in view .is-on). Written in the page after reel.js.
 *   .pm-drop path, .pm-draws .pm-line   measured, so the CSS can draw each line from its start to its end
 *   [data-count="5.9"]                  counts up to its number (keeping its decimals) each time its screen comes on
 * Everything else is CSS (pamphlet.css). Asking the phone for less motion shows every line drawn and every number whole. */
(function () {
  var root = document.querySelector(".pm");
  if (!root || root.dataset.pmOn) return;
  root.dataset.pmOn = "1";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  [].forEach.call(root.querySelectorAll(".pm-drop path, .pm-draws .pm-line"), function (p) {
    var len = 300;
    try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) {}
    p.style.setProperty("--len", len);
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = reduce ? 0 : len;
  });

  var nums = [].slice.call(root.querySelectorAll("[data-count]"));
  function show(el, v) {
    var dp = (el.getAttribute("data-count").split(".")[1] || "").length;
    el.textContent = v.toFixed(dp);
  }
  nums.forEach(function (el) { show(el, reduce ? parseFloat(el.getAttribute("data-count")) : 0); });
  if (reduce) return;
  function run(el) {
    var to = parseFloat(el.getAttribute("data-count")), t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      show(el, to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // Count each time the screen arrives (reel.js toggles .is-on on the screen).
  var seen = new WeakMap();
  new MutationObserver(function () {
    nums.forEach(function (el) {
      var on = !!el.closest(".rl-p.is-on");
      if (on && !seen.get(el)) run(el);
      seen.set(el, on);
      if (!on) show(el, 0);
    });
  }).observe(root, { subtree: true, attributes: true, attributeFilter: ["class"] });
})();
