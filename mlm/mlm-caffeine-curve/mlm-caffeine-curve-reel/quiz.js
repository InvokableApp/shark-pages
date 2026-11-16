/* mlm/mlm-caffeine-curve/mlm-caffeine-curve-reel/quiz.js (Marketing Shark | MLM): the questions on the reel's own screens.
 * Built from the skin quiz reel's quiz.js (mlm/mlm-skin-quiz). Each .qz-opts row is one answer (data-key); a screen is
 * done when every row on it has one, and then it moves on. The dock starts the questions, then opens the contact form only
 * once every answer is in. THE ANSWERS RIDE WITH THE FORM (window.__pfExtra -> contacts.custom mlm_cc_*): the answers in
 * words, the number from calc.js, and mlm_cc_q, the result page's address (the delivery email links to it).
 * THE NEXT STEP is the result page with the answers in its address (window.__PF__.next, set on every answer). */
(function () {
  var root = document.querySelector(".rl-cc");
  if (!root || !window.mlmCaffeine) return;
  var RESULT = "/mlm-caffeine-curve-result", START = "Start the 5 question check", SEE = "See my number";
  var KEYS = ["b", "k", "z", "m", "n", "a", "l"];
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
  var ready = root.querySelector("[data-qz-ready]");
  var picked = {}, extra = window.__pfExtra = {};
  var on = 0;

  qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });

  function to(s) { if (s) track.scrollTo({ top: s.offsetTop, behavior: "smooth" }); }
  function done(s) { return [].every.call(s.querySelectorAll(".qz-opts"), function (o) { return !!picked[o.getAttribute("data-key")]; }); }
  function missing() { for (var i = 0; i < qs.length; i++) if (!done(qs[i])) return qs[i]; return null; }

  function route() {
    var r = window.mlmCaffeine.calc(picked), cfg = window.__PF__;
    if (!r) return;
    var q = KEYS.map(function (k) { return k + "=" + picked[k]; }).join("&");
    extra.mlm_cc_bedtime = r.labels.b; extra.mlm_cc_drink = r.labels.k; extra.mlm_cc_size = r.labels.z;
    extra.mlm_cc_before_10 = r.labels.m; extra.mlm_cc_10_to_2 = r.labels.n; extra.mlm_cc_after_2 = r.labels.a; extra.mlm_cc_last_drink = r.labels.l;
    extra.mlm_cc_mg_at_bed = r.value; extra.mlm_cc_band = r.band; extra.mlm_cc_cutoff = r.clock.cutoff; extra.mlm_cc_clear_at = r.clock.clears;
    extra.mlm_cc_q = q;
    if (cfg) cfg.next = RESULT + "?" + q;
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".qz-opts button");
    if (!b) return;
    var row = b.closest(".qz-opts"), sec = b.closest(".rl-p");
    [].forEach.call(row.querySelectorAll("button"), function (x) { x.classList.toggle("is-picked", x === b); });
    picked[row.getAttribute("data-key")] = b.getAttribute("data-v");
    route();
    if (!done(sec)) return;
    var i = screens.indexOf(sec) + 1;
    setTimeout(function () { to(screens[i]); }, 300);
  });

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

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".pfn-dock, .rl-cc .rl-cta");
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
