/* glp/which-work-from-home-model-is-right-for-you-quiz-funnel/side-hustle-quiz-reel/quiz.js: the lead-gen match quiz's
 * moves (a copy of _leadgen/side-hustle-match/side-hustle-match-reel/quiz.js) with GLP's survey field names as the keys.
 * A tap on an answer keeps it and moves to the next question; the interests take several, then Next. Joe's branching:
 * single hides "Not me, but my spouse is"; "Yes, I am" asks the job and words the hours question for someone with a
 * job; over $100k skips "ready to invest". The answers ride with the form as window.__pfExtra (platform form.js), keyed
 * by readable names so a rep's lead page shows them as they are. */
(function () {
  var root = document.querySelector(".rl-match");
  if (!root) return;
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var answers = window.__pfExtra = {};
  var flags = { employed: false, single: false, high: false };

  function shown(s) { return !s.hidden; }
  function apply() {
    screens.forEach(function (s) {
      var c = s.getAttribute("data-qz-if");
      if (c === "employed") s.hidden = !flags.employed;
      if (c === "not-high") s.hidden = flags.high;
    });
    var sp = root.querySelector("[data-qz-spouse]"); if (sp) sp.hidden = flags.single;
    var h = root.querySelector("[data-qz-hours-employed]");
    if (h) { if (!h.dataset.other) h.dataset.other = h.textContent; h.textContent = flags.employed ? h.getAttribute("data-qz-hours-employed") : h.dataset.other; }
    // "Question 3 of 9", counting only the questions this visitor gets.
    var qs = screens.filter(function (s) { return s.hasAttribute("data-qz") && shown(s); });
    qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });
    // The dots on the side follow: a skipped question has no dot.
    var dots = [].slice.call(root.querySelectorAll(".rl-dots button"));
    dots.forEach(function (d, i) { if (screens[i]) d.hidden = screens[i].hidden; });
  }
  function next(from) {
    var i = screens.indexOf(from) + 1;
    while (screens[i] && screens[i].hidden) i++;
    if (screens[i]) track.scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b || b.disabled) return;
    var sec = b.closest(".rl-p");
    if (!sec) return;
    if (b.hasAttribute("data-qz-next")) {
      var t = sec.querySelector(".qz-text input");
      if (t && t.value.trim()) answers[sec.getAttribute("data-qz")] = t.value.trim().slice(0, 200);
      next(sec); return;
    }
    if (!b.closest(".qz-opts")) return;
    var key = sec.getAttribute("data-qz");
    if (sec.hasAttribute("data-qz-many")) {
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      var picked = [].slice.call(sec.querySelectorAll('.qz-opts [aria-pressed="true"]')).map(function (x) { return x.textContent.trim(); });
      if (picked.length) answers[key] = picked.join("; "); else delete answers[key];
      sec.querySelector("[data-qz-next]").disabled = !picked.length;
      return;
    }
    [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
    answers[key] = b.textContent.replace(/\s+/g, " ").trim();
    if (key === "wfh_parent_status") flags.single = b.hasAttribute("data-qz-single");
    if (key === "wfh_employment") flags.employed = b.hasAttribute("data-qz-employed");
    if (key === "wfh_household_income") flags.high = b.hasAttribute("data-qz-high");
    if (key === "wfh_employment" && !flags.employed) delete answers["wfh_occupation"];
    if (key === "wfh_household_income" && flags.high) delete answers["wfh_investment_ready"];
    apply();
    setTimeout(function () { next(sec); }, 260);
  });
  // Enter in the job box moves on, as Next does.
  [].forEach.call(root.querySelectorAll(".qz-text input"), function (inp) {
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); inp.blur(); inp.parentNode.querySelector("[data-qz-next]").click(); } });
  });
  apply();
})();
