/* glp/what-weight-loss-is-best-for-you-interactive-funnel/weight-quiz-reel/quiz.js: the lead-gen match quiz's moves (a
 * copy of _leadgen/side-hustle-match/side-hustle-match-reel/quiz.js) with the weight loss survey's field names as the
 * keys and no branching: the survey has none. A tap on an answer keeps it and moves to the next question; the features
 * screen takes several, then Next (none picked is fine: the survey didn't require it). The answers ride with the form
 * as window.__pfExtra (platform form.js), keyed by the survey's field names so a rep's lead page shows them as before. */
(function () {
  var root = document.querySelector(".rl-match");
  if (!root) return;
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var answers = window.__pfExtra = {};

  function apply() {
    // "Question 3 of 7"
    var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
    qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });
  }
  function next(from) {
    var i = screens.indexOf(from) + 1;
    if (screens[i]) track.scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b || b.disabled) return;
    var sec = b.closest(".rl-p");
    if (!sec) return;
    if (b.hasAttribute("data-qz-next")) { next(sec); return; }
    if (!b.closest(".qz-opts")) return;
    var key = sec.getAttribute("data-qz");
    if (sec.hasAttribute("data-qz-many")) {
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      var picked = [].slice.call(sec.querySelectorAll('.qz-opts [aria-pressed="true"]')).map(function (x) { return x.textContent.trim(); });
      if (picked.length) answers[key] = picked.join("; "); else delete answers[key];
      return;
    }
    [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
    answers[key] = b.textContent.replace(/\s+/g, " ").trim();
    setTimeout(function () { next(sec); }, 260);
  });
  apply();
})();
