/* shark-reveal.js — shared scroll-effects engine for hosted blocks.
 *
 * Load it from a block's block.js:
 *   (function(){var s=document.createElement("script");
 *    s.src="https://invokableapp.github.io/shark-pages/_shared/shark-reveal/v1/shark-reveal.js";
 *    document.head.appendChild(s);})();
 *
 * It is declarative and design-agnostic: it only toggles classes and sets a
 * --sk-i index. The block's own CSS decides what the motion looks like.
 *
 *   data-sk-reveal            element animates in when it enters the viewport (once)
 *   data-sk-stagger           on a PARENT: its data-sk-reveal children get --sk-i 0,1,2…
 *   data-sk-count="4200"      number counts up to this value the first time it is seen
 *   data-sk-count-suffix="+"  appended after the counted number
 *   data-sk-parallax="0.12"   translates on scroll by (progress * strength * height)
 *
 * PROGRESSIVE ENHANCEMENT, deliberately: this script adds `sk-motion` to <html>,
 * and the hiding CSS is written as `.sk-motion [data-sk-reveal]{opacity:0}`. So if
 * Pages is slow, the file 404s, or JS is off, every element renders fully visible.
 * Never write the hidden state without the .sk-motion guard.
 *
 * Honours prefers-reduced-motion: everything is revealed at once, counters jump to
 * their final value, parallax is skipped.
 */
(function () {
  if (window.__sharkReveal) return;
  window.__sharkReveal = true;

  var root = document.documentElement;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  if (calm || !io) { root.classList.add("sk-motion-off"); finishAll(); return; }
  root.classList.add("sk-motion");

  function finishAll() {
    each("[data-sk-reveal]", function (el) { el.classList.add("sk-in"); });
    each("[data-sk-count]", function (el) { el.textContent = fmt(+el.getAttribute("data-sk-count")) + suffix(el); });
  }
  function each(sel, fn) {
    var n = document.querySelectorAll(sel);
    for (var i = 0; i < n.length; i++) fn(n[i], i);
  }
  function suffix(el) { return el.getAttribute("data-sk-count-suffix") || ""; }
  function fmt(v) { return v >= 1000 ? v.toLocaleString("en-US") : String(v); }

  // stagger: index each revealing child of a data-sk-stagger parent
  each("[data-sk-stagger]", function (p) {
    var kids = p.querySelectorAll("[data-sk-reveal]");
    for (var i = 0; i < kids.length; i++) kids[i].style.setProperty("--sk-i", i);
  });

  var revealer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e.isIntersecting) continue;
      e.target.classList.add("sk-in");
      revealer.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  each("[data-sk-reveal]", function (el) { revealer.observe(el); });

  // count-up, eased, ~1.1s
  var counter = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e.isIntersecting) continue;
      counter.unobserve(e.target);
      run(e.target);
    }
  }, { threshold: 0.4 });
  each("[data-sk-count]", function (el) {
    el.textContent = "0" + suffix(el);
    counter.observe(el);
  });

  function run(el) {
    var target = +el.getAttribute("data-sk-count");
    var dp = (el.getAttribute("data-sk-count-decimals") | 0);
    var sfx = suffix(el), t0 = null, DUR = 1100;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = target * eased;
      el.textContent = (dp ? v.toFixed(dp) : fmt(Math.round(v))) + sfx;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = (dp ? target.toFixed(dp) : fmt(target)) + sfx;
    }
    requestAnimationFrame(frame);
  }

  // parallax — transform only, batched into one rAF, never touches layout
  var pxs = document.querySelectorAll("[data-sk-parallax]");
  if (pxs.length) {
    var ticking = false;
    var tick = function () {
      ticking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < pxs.length; i++) {
        var el = pxs[i], r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;   // -1 … 1 through the viewport
        var strength = parseFloat(el.getAttribute("data-sk-parallax")) || 0.1;
        el.style.transform = "translate3d(0," + (-progress * strength * r.height).toFixed(2) + "px,0)";
      }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
  }
})();
