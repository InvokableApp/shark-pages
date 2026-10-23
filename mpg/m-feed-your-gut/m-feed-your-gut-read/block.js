/* mpg/m-feed-your-gut/m-feed-your-gut-read: the read-online recipes' two jobs. By hand (from the Vagus read page's).
 *   1. the menu: a reading-progress hairline, and the section you're in lit up (scrolled into view in the menu)
 *   2. the shopping list's tick boxes, kept in this browser only (localStorage, every access guarded: a private window
 *      or blocked storage still ticks for the visit, it just isn't kept)
 * Scoped to .vr-read; every lookup guarded, so a throw never takes the page's other scripts down.
 */
(function () {
  "use strict";
  var root = document.querySelector(".vr-read");
  if (!root) return;

  /* ---------- 1. menu ---------- */
  var bar = root.querySelector(".vrnav-bar i");
  var links = [].slice.call(root.querySelectorAll(".vrnav-links a"));
  var targets = links.map(function (a) { return root.querySelector(a.getAttribute("href")); });
  var ticking = false, lit = null;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var top = root.getBoundingClientRect().top, h = root.offsetHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? Math.min(1, Math.max(0, -top / h)) * 100 : 0).toFixed(2) + "%";
      var on = null;
      for (var i = 0; i < targets.length; i++) if (targets[i] && targets[i].getBoundingClientRect().top < 120) on = links[i];
      if (on !== lit) {
        if (lit) lit.classList.remove("on");
        if (on) { on.classList.add("on"); var nav = on.parentNode; nav.scrollTo({ left: on.offsetLeft - nav.clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" }); }
        lit = on;
      }
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. the shopping list's ticks, kept on this phone (every access guarded) ---------- */
  var boxes = [].slice.call(root.querySelectorAll(".k-shop input[type=checkbox]"));
  if (!boxes.length) return;
  var KEY = "fy-shop-v1", saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { saved = []; }
  boxes.forEach(function (b, i) {
    b.checked = saved.indexOf(i) > -1;
    b.addEventListener("change", function () {
      var on = []; boxes.forEach(function (x, j) { if (x.checked) on.push(j); });
      try { localStorage.setItem(KEY, JSON.stringify(on)); } catch (e) {}
    });
  });
})();
