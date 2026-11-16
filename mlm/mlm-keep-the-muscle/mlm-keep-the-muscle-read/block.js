/* mlm/mlm-keep-the-muscle/mlm-keep-the-muscle-read: the reading bar under the nav and the nav's smooth jumps.
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
})();
