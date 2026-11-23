/* beneve/beneve-product-quiz/b-match-reel/quiz.js: the product quiz's moves, the skin quiz's quiz.js (beneve-skin-diagnostic/
 * b-skin-reel/quiz.js) with this quiz's root, words and the 8 question ids as keys. A tap on an answer keeps it and moves on.
 * The answers ride with the form as window.__pfExtra; the form's endings (window.__PF__.form.endings, first match wins)
 * pick the result page, the same list the server tags the lead from (platform lib/survey-endings.mjs).
 * THE DOCK: on the cover it says "Take the 60 second quiz" and jumps to question 1 (or the first one not answered); it
 * hides on the questions; on the last screen it says "Show me my match" and opens the form. */
(function () {
  var root = document.querySelector(".rl-bq");
  if (!root) return;
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
  var ready = root.querySelector("[data-qz-ready]");
  var answers = window.__pfExtra = {};
  // The page's language (platform page-words, window.__pfWords): English when none are sent.
  function W(k, d) { var w = window.__pfWords; return (w && w[k]) || d; }
  var START = W("beneve.pq_start", "Take the 60 second quiz"), SEE = W("beneve.pq_see", "Show me my match");
  var on = 0;

  qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = W("quiz.question_n", "Question {n} of {t}").replace("{n}", i + 1).replace("{t}", qs.length); });

  function to(s) { if (s) track.scrollTo({ top: s.offsetTop, behavior: "smooth" }); }
  function missing() { for (var i = 0; i < qs.length; i++) if (!answers[qs[i].getAttribute("data-qz")]) return qs[i]; return null; }

  // First ending whose every condition holds (survey-endings.mjs holds(): eq, neq, contains).
  function holds(c) {
    var v = answers[c.field] == null ? "" : String(answers[c.field]), want = String(c.value == null ? "" : c.value);
    if (c.op === "neq") return v !== want;
    if (c.op === "contains") return v.toLowerCase().indexOf(want.toLowerCase()) > -1;
    return v === want;
  }
  function route() {
    var cfg = window.__PF__, ends = cfg && cfg.form && cfg.form.endings;
    if (!ends || !ends.length) return;
    if (cfg.__bqDefault === undefined) cfg.__bqDefault = cfg.next;
    var hit = null;
    for (var i = 0; i < ends.length && !hit; i++) if ((ends[i].when || []).every(holds) && /^\/[a-z0-9][a-z0-9\/_-]*$/i.test(ends[i].to || "")) hit = ends[i];
    cfg.next = hit ? hit.to : cfg.__bqDefault;
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".qz-opts button");
    if (!b) return;
    var sec = b.closest(".rl-p");
    [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
    answers[sec.getAttribute("data-qz")] = b.getAttribute("data-v");
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
    var t = e.target.closest && e.target.closest(".pfn-dock, .rl-bq .rl-cta");
    if (!t) return;
    var gap = missing();
    if (screens[on] === ready && !gap) { route(); return; }   // form.js opens the form
    e.preventDefault(); e.stopImmediatePropagation();
    to(gap || qs[0]);
  }, true);

  // The dock is drawn by the platform after this runs: give it its words once it is there.
  var tries = 0;
  (function hook() {
    if (!document.querySelector(".pfn-dock")) { if (tries++ < 40) setTimeout(hook, 250); return; }
    mark(on);
  })();
})();
