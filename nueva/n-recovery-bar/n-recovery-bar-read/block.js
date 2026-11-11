/* nueva/n-recovery-bar/n-recovery-bar-read: The Recovery Bar, read online. Vanilla only (a hosted block is injected
 * with innerHTML, so a <script src> inside the markup never runs). The drop pages get a copy from build-pages.mjs.
 *  1. reading bar   the thin yellow line under the nav fills as you scroll
 *  2. nav           smooth scroll to a section (the page's own html can't be given scroll-behavior from a block)
 *  3. numbers       each card's three numbers count up once when it comes on screen; still under reduced motion
 *  0. empty links  a [data-needs] link with no value (the PDF before it exists) is hidden
 *  4. shopping list ticks are kept on this device (localStorage, guarded: private windows throw)
 */
(function () {
  var root = document.querySelector(".rb-read");
  if (!root || root.dataset.rbBooted) return;
  root.dataset.rbBooted = "1";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // a link whose value is empty (the PDF before it exists) leaves the page; the reel kit does this for reels
  root.querySelectorAll("[data-needs]").forEach(function (el) {
    var v = (el.getAttribute("data-needs") || "").trim();
    if (!v || /\{\{|^https?:\/\/$/.test(v)) el.style.display = "none";
  });

  var bar = root.querySelector(".rb-bar i");
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
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.querySelectorAll("b[data-to]").forEach(function (b) {
          var to = +b.dataset.to, t0 = null;
          function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / 700), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
            b.textContent = v.toLocaleString("en-US");
            if (p < 1) requestAnimationFrame(step);
          }
          b.textContent = "0"; requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.35 });
    root.querySelectorAll(".rb-nums").forEach(function (n) { io.observe(n); });
  }

  var KEY = "rb-stock";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  root.querySelectorAll(".rb-aisles input").forEach(function (box, i) {
    box.checked = !!saved[i];
    box.addEventListener("change", function () {
      saved[i] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
