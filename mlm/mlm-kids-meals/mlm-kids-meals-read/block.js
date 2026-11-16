/* mlm/mlm-kids-meals/mlm-kids-meals-read: the reading bar under the nav, the nav's smooth jumps, and the grocery
 * list's ticks remembered in this browser (guarded: storage can throw in a private window).
 * Vanilla only (a hosted block is injected with innerHTML, so a <script src> inside the markup never runs). */
(function () {
  var root = document.querySelector(".pb-read");
  if (!root || root.dataset.pbBooted) return;
  root.dataset.pbBooted = "1";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bar = root.querySelector(".pb-bar i");
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
    };
    window.addEventListener("scroll", tick, { passive: true }); tick();
  }
  root.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = root.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 56, behavior: reduce ? "auto" : "smooth" });
    });
  });
  var KEY = "mlm-kids-meals-grocery", saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  root.querySelectorAll(".pb-aisle label").forEach(function (l) {
    var box = l.querySelector("input"), name = (l.querySelector("span") || {}).textContent || "";
    if (!box || !name) return;
    if (saved[name]) box.checked = true;
    box.addEventListener("change", function () {
      saved[name] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
