/* sky.js — the ONE sky behind the Beneve product quiz's reels (Jeff, 2026-11-17: "can we make it so that the sky doesnt
 * swipe? ... maybe theres a smoother mechanism?"). The sky sits still under the track; only the words swipe. Each sky
 * screen says where the sky should be when it comes on (data-sky = how far into the day the colour is, 0 to 100;
 * data-sun or data-moon = "x,y" in %, data-stars), and this eases the one sky there: the colour shifts, the sun steps
 * along its arc, sets below the right end when the evening starts, and the moon rises from below the left end.
 * A screen with no data-sky (the paper products screen) keeps the sky as it was. Written by hand, shared by all five reels. */
(function () {
  var root = document.querySelector(".rl-bq"), sky = root && root.querySelector(".bq-sky");
  if (!sky) return;
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var sun = sky.querySelector(".bq-sun"), moon = sky.querySelector(".bq-moon");
  var RISE = ["12", "34"], SET = ["88", "34"];
  function put(el, p, show) { el.style.left = p[0] + "%"; el.style.top = p[1] + "%"; el.style.opacity = show ? "1" : "0"; }
  function apply(s) {
    if (!s || !s.hasAttribute("data-sky")) return;
    sky.style.setProperty("--sky", s.getAttribute("data-sky") + "%");
    var sp = s.getAttribute("data-sun"), mp = s.getAttribute("data-moon");
    if (sp) { put(sun, sp.split(","), true); put(moon, RISE, false); }
    else if (mp) { put(moon, mp.split(","), true); put(sun, SET, false); }
    sky.classList.toggle("is-night", s.hasAttribute("data-stars"));
    sky.classList.toggle("is-late", /\brl-sky-late\b/.test(s.className));
  }
  // first paint: the sun below the horizon at the first screen's colour, then it comes up
  var first = screens[0];
  if (first && first.hasAttribute("data-sky")) sky.style.setProperty("--sky", first.getAttribute("data-sky") + "%");
  put(sun, RISE, true); put(moon, RISE, false);
  var mo = new MutationObserver(function (ms) {
    ms.forEach(function (m) { if (m.target.classList.contains("is-on")) apply(m.target); });
  });
  screens.forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ["class"] }); });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      sky.classList.add("is-ready");
      apply(root.querySelector(".rl-p.is-on") || first);
    });
  });
})();
