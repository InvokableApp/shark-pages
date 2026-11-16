/* mlm/mlm-hydration/mlm-hydration-reel/quiz.js (Marketing Shark | MLM): the questions on the reel's own screens.
 * Built from the skin quiz reel's quiz.js (mlm/mlm-skin-quiz). A tap picks an answer and moves on; the dock (and the
 * computer's button) starts the questions, then opens the contact form only once every answer is in.
 * THE ANSWERS RIDE WITH THE FORM (window.__pfExtra -> contacts.custom): the four answers in words, the number from
 * calc.js, and mlm_hy_q, the result page's address, which the delivery email links to.
 * THE NEXT STEP is the result page with the answers in its address: window.__PF__.next is set on every answer
 * (form.js goes to cfg.next after the lead is saved). */
(function () {
  var root = document.querySelector(".rl-hyd");
  if (!root || !window.mlmHydration) return;
  var RESULT = "/mlm-hydration-result", START = "Start the 4 question check", SEE = "See my number";
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
  var ready = root.querySelector("[data-qz-ready]");
  var picked = {}, extra = window.__pfExtra = {};
  var on = 0;

  qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });

  function to(s) { if (s) track.scrollTo({ top: s.offsetTop, behavior: "smooth" }); }
  function missing() { for (var i = 0; i < qs.length; i++) if (!picked[qs[i].getAttribute("data-qz")]) return qs[i]; return null; }

  function route() {
    var r = window.mlmHydration.calc(picked), cfg = window.__PF__;
    if (!r) return;
    var q = "w=" + picked.w + "&s=" + picked.s + "&h=" + picked.h + "&d=" + picked.d;
    extra.mlm_hy_weight = r.labels.w; extra.mlm_hy_sweat = r.labels.s; extra.mlm_hy_heat = r.labels.h; extra.mlm_hy_drinks = r.labels.d;
    extra.mlm_hy_need_oz = r.need; extra.mlm_hy_drink_oz = r.drink; extra.mlm_hy_gap_bottles = r.gapBottles;
    extra.mlm_hy_sodium_mg = r.sodium; extra.mlm_hy_band = r.band; extra.mlm_hy_q = q;
    if (cfg) cfg.next = RESULT + "?" + q;
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".qz-opts button");
    if (!b) return;
    var sec = b.closest(".rl-p");
    [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
    picked[sec.getAttribute("data-qz")] = b.getAttribute("data-v");
    route();
    var i = screens.indexOf(sec) + 1;
    setTimeout(function () { to(screens[i]); }, 260);
  });

  // Which screen is on: the dock's words and whether it shows follow it.
  function label(t) {
    var d = document.querySelector(".pfn-dock .pfn-txt b"); if (d && d.textContent !== t) d.textContent = t;
    var c = root.querySelector(".rl-cta"); if (c && c.textContent !== t) c.textContent = t;
  }
  function mark(i) {
    on = i;
    var s = screens[i];
    root.classList.toggle("qz-in-q", s.hasAttribute("data-qz"));
    label(s === ready ? SEE : START);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) mark(screens.indexOf(e.target)); });
  }, { root: track, threshold: 0.6 });
  screens.forEach(function (s) { io.observe(s); });

  // The dock and the computer's button, before the platform's form sees the tap (capture phase).
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".pfn-dock, .rl-hyd .rl-cta");
    if (!t) return;
    var gap = missing();
    if (screens[on] === ready && !gap) { route(); return; }   // form.js opens the form
    e.preventDefault(); e.stopImmediatePropagation();
    to(gap || qs[0]);
  }, true);

  var tries = 0;
  (function hook() {
    if (!document.querySelector(".pfn-dock")) { if (tries++ < 40) setTimeout(hook, 250); return; }
    mark(on);
  })();
})();
