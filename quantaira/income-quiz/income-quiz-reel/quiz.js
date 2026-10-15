/* quantaira/income-quiz/income-quiz-reel/quiz.js — the passive income quiz's moves (see block.html).
 * A tap on an answer keeps it and moves to the next screen; "What have you tried" takes several, then Next. Every
 * answer adds its points (#pq-scoring, from quiz.json) and the result is worked out again each time:
 *   - most points wins; a tie goes to the first in quiz.json's tiebreak order;
 *   - an answer with "never" rules that result out ("I can't afford to lose any of it" never lands on trading).
 * The answers ride with the form as window.__pfExtra (platform form.js) into the contact, under pq_<question>, with the
 * result as pq_result (its plain name, for the rep's alert and the emails) and pq_result_key. The key is also kept in
 * this browser (sessionStorage "quantaira-pq") for the result page. */
(function () {
  var root = document.querySelector(".rl-pq");
  var data = document.getElementById("pq-scoring");
  if (!root || !data) return;
  data = JSON.parse(data.textContent);
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var answers = window.__pfExtra = {};
  var picks = {};   // question id -> [answer index, ...]

  function result() {
    var score = {}, never = {};
    data.questions.forEach(function (qq) {
      (picks[qq.id] || []).forEach(function (i) {
        var a = qq.a[i]; if (!a) return;
        Object.keys(a.s).forEach(function (k) { score[k] = (score[k] || 0) + a.s[k]; });
        if (a.never) never[a.never] = true;
      });
    });
    var best = null;
    data.tiebreak.forEach(function (k) {
      if (never[k]) return;
      if (best === null || (score[k] || 0) > (score[best] || 0)) best = k;
    });
    return best;
  }
  function keep() {
    var k = result();
    answers.pq_result_key = k;
    answers.pq_result = data.names[k];
    try { sessionStorage.setItem("quantaira-pq", k); } catch (e) {}
  }
  function count() {
    var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
    qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });
  }
  function next(from) {
    var s = screens[screens.indexOf(from) + 1];
    if (s) track.scrollTo({ top: s.offsetTop, behavior: "smooth" });
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b || b.disabled) return;
    var sec = b.closest(".rl-p");
    if (!sec) return;
    if (b.hasAttribute("data-qz-next")) { next(sec); return; }
    if (!b.closest(".qz-opts")) return;
    var key = sec.getAttribute("data-qz"), id = key.replace(/^pq_/, "");
    var all = [].slice.call(sec.querySelectorAll(".qz-opts button"));
    if (sec.hasAttribute("data-qz-many")) {
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      var on = all.filter(function (x) { return x.getAttribute("aria-pressed") === "true"; });
      picks[id] = on.map(function (x) { return +x.getAttribute("data-a"); });
      if (on.length) answers[key] = on.map(function (x) { return x.textContent.trim(); }).join("; "); else delete answers[key];
      sec.querySelector("[data-qz-next]").disabled = !on.length;
      keep();
      return;
    }
    all.forEach(function (x) { x.classList.toggle("is-picked", x === b); });
    picks[id] = [+b.getAttribute("data-a")];
    answers[key] = b.textContent.replace(/\s+/g, " ").trim();
    keep();
    setTimeout(function () { next(sec); }, 260);
  });
  count();
  keep();
})();
