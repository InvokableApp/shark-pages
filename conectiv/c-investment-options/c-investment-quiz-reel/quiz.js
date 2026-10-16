/* conectiv/c-investment-options/c-investment-quiz-reel/quiz.js: the investment quiz reel's moves (the side hustle quiz's,
 * without its branching: this survey has none). A tap on an answer keeps it and moves to the next question. The answers
 * ride with the form as window.__pfExtra (platform form.js) under the survey's field names, and are kept in this browser
 * (sessionStorage "c-invest") so the results reel can show the visitor their own answers. */
(function () {
  var root = document.querySelector(".rl-match");
  if (!root) return;
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var answers = window.__pfExtra = {};

  function keep() { try { sessionStorage.setItem("c-invest", JSON.stringify(answers)); } catch (e) {} }
  function count() {
    var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
    qs.forEach(function (s, i) {
      var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length;
      var p = s.querySelector(".qz-prog"); if (p) p.style.setProperty("--lk-p", Math.round((i + 1) / qs.length * 100) + "%");
    });
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
    [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
    answers[sec.getAttribute("data-qz")] = b.textContent.replace(/\s+/g, " ").trim();
    keep();
    setTimeout(function () { next(sec); }, 260);
  });
  count();
})();
