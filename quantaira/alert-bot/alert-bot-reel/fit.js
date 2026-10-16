/* quantaira/alert-bot — each screen's words as big as that phone allows (Jeff, 2026-10-16: "can we up the font size on
 * those pages?"). The type starts big (block.css, sizes x var(--fit)); a screen whose words would run under the bottom
 * button, on this phone and in this language (German and Hungarian run long), steps its own --fit down until they clear,
 * never below MIN. Loaded by all three pages' block.js. Measured with the entrance animation's offset taken off. */
(function () {
  var root = document.querySelector(".rl.rl-look-signal");
  if (!root || root.dataset.qabFit) return;
  root.dataset.qabFit = "1";
  var MIN = 0.78, STEP = 0.04, ROOM = 8;
  function limit() {
    var d = document.querySelector(".pfn-dock");
    if (d && getComputedStyle(d).display !== "none") return d.getBoundingClientRect().top - ROOM;
    var c = root.querySelector(".rl-cta");
    if (c && getComputedStyle(c).display !== "none" && getComputedStyle(c).position === "fixed") return c.getBoundingClientRect().top - ROOM;
    return window.innerHeight - ROOM;
  }
  function topLimit() {
    var bar = root.querySelector(".qab-bonus");
    return bar ? bar.getBoundingClientRect().bottom + 4 : 4;
  }
  function span(sec) {
    var st = sec.getBoundingClientRect().top, lo = Infinity, hi = 0;
    var els = sec.querySelectorAll(".rl-in *");
    for (var i = 0; i < els.length; i++) {
      var e = els[i], cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
      var r = e.getBoundingClientRect();
      if (!r.height) continue;
      lo = Math.min(lo, r.top - st); hi = Math.max(hi, r.bottom - st);
    }
    return { lo: lo, hi: hi };
  }
  function fit() {
    root.classList.add("qab-measuring");
    var bottom = limit(), top = topLimit();
    [].forEach.call(root.querySelectorAll(".rl-p"), function (sec) {
      var f = 1;
      sec.style.setProperty("--fit", "1");
      var s = span(sec);
      while ((s.hi > bottom || s.lo < top) && f - STEP >= MIN) {
        f = Math.round((f - STEP) * 100) / 100;
        sec.style.setProperty("--fit", String(f));
        s = span(sec);
      }
    });
    root.classList.remove("qab-measuring");
  }
  var t = null;
  function soon(ms) { clearTimeout(t); t = setTimeout(fit, ms || 120); }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { soon(0); });
  window.addEventListener("load", function () { soon(0); });
  setTimeout(fit, 700);             // the dock is drawn by the platform after the page's own scripts
  window.addEventListener("resize", function () { soon(150); });
})();
