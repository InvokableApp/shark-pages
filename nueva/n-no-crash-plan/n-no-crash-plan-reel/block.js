/* nueva/n-no-crash-plan/n-no-crash-plan-reel — the reel's moves (platform only; see block.html).
 * Which screen is on (it animates in, the dots follow), the helper arrows until the first flick, the arrows and
 * keys on a computer, and a flick past the last screen opens the form, the same as the button. The form, the sheet
 * and the dock are the platform's (form.js, funnel-native.js). */
(function () {
  var root = document.querySelector(".rl");
  if (!root) return;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var dots = root.querySelector(".rl-dots"), on = 0;
  var LIGHT = /\brl-(paper|tint)\b/;

  screens.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", "Screen " + (i + 1));
    b.addEventListener("click", function () { go(i); });
    dots.appendChild(b);
  });
  function go(i) {
    i = Math.max(0, Math.min(screens.length - 1, i));
    track.scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  }
  function opener() { return document.querySelector(".pfn-dock") || root.querySelector(".rl-cta"); }
  function mark(i) {
    on = i;
    screens.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    [].forEach.call(dots.children, function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    dots.style.setProperty("--dot", LIGHT.test(screens[i].className) ? "#1f2420" : "#fff");
    var d = document.querySelector(".pfn-dock");
    if (d) d.classList.toggle("rl-pulse", i === screens.length - 1);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) mark(screens.indexOf(e.target)); });
  }, { root: track, threshold: 0.6 });
  screens.forEach(function (s) { io.observe(s); });
  mark(0);

  track.addEventListener("scroll", function () { if (track.scrollTop > 24) root.classList.add("rl-moved"); }, { passive: true });

  // A computer: the arrows beside the frame, and the keys.
  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-go]");
    if (b) go(on + Number(b.getAttribute("data-go")));
  });
  document.addEventListener("keydown", function (e) {
    if (document.querySelector(".pf-ov[data-open]") || /^(INPUT|SELECT|TEXTAREA)$/.test((e.target || {}).tagName)) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(on + 1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(on - 1); }
  });

  // A flick up past the last screen opens the form.
  var y0 = null;
  track.addEventListener("touchstart", function (e) { y0 = on === screens.length - 1 ? e.touches[0].clientY : null; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (y0 == null) return;
    var dy = (e.changedTouches[0] || {}).clientY - y0; y0 = null;
    if (dy < -70 && track.scrollTop + track.clientHeight >= track.scrollHeight - 4) { var o = opener(); if (o) o.click(); }
  });
})();
