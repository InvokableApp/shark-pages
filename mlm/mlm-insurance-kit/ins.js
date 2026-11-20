/* mlm/mlm-insurance-kit/ins.js (Marketing Shark | MLM): the quiz engine for the four insurance checks.
 * From mlm-swap-quiz's quiz.js, plus: a typed dollar answer (data-qz-money), and the answers kept in sessionStorage
 * ("mlmins:<funnel>") so the one result page (result.js) can work the answer out. Root: <div class="rl ins-q" data-ins="fe"
 * data-start="See my funeral cost" data-see="Show my number">. Routing (IUL, career): #ins-endings, the same list as the
 * form's endings in the migration; change both together. */
(function () {
  var root = document.querySelector(".ins-q");
  if (!root) return;
  var key = "mlmins:" + root.getAttribute("data-ins");
  var track = root.querySelector(".rl-track");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var qs = screens.filter(function (s) { return s.hasAttribute("data-qz"); });
  var ready = root.querySelector("[data-qz-ready]");
  var answers = window.__pfExtra = {};
  var START = root.getAttribute("data-start"), SEE = root.getAttribute("data-see");
  var on = 0;

  qs.forEach(function (s, i) { var e = s.querySelector("[data-qz-count]"); if (e) e.textContent = "Question " + (i + 1) + " of " + qs.length; });
  function keep() { try { sessionStorage.setItem(key, JSON.stringify(answers)); } catch (x) {} }
  function to(s) { if (s) track.scrollTo({ top: s.offsetTop, behavior: "smooth" }); }
  function missing() { for (var i = 0; i < qs.length; i++) if (!answers[qs[i].getAttribute("data-qz")]) return qs[i]; return null; }

  function holds(c) {
    var v = answers[c.field] == null ? "" : String(answers[c.field]), want = String(c.value == null ? "" : c.value);
    if (c.op === "neq") return v !== want;
    if (c.op === "contains") return v.toLowerCase().indexOf(want.toLowerCase()) > -1;
    return v === want;
  }
  function route() {
    var cfg = window.__PF__ || {}, ends = cfg.form && cfg.form.endings;
    if (!ends || !ends.length) { try { ends = JSON.parse((document.getElementById("ins-endings") || {}).textContent || "[]"); } catch (x) { ends = []; } }
    if (!ends || !ends.length) return;
    if (cfg.__skDefault === undefined) cfg.__skDefault = cfg.next;
    var hit = null;
    for (var i = 0; i < ends.length && !hit; i++) if ((ends[i].when || []).every(holds) && /^\/[a-z0-9][a-z0-9\/_-]*$/i.test(ends[i].to || "")) hit = ends[i];
    cfg.next = hit ? hit.to : cfg.__skDefault;
  }
  // A question asked about "them" reads "you" once they've said it's for themselves (data-q-me holds that wording).
  function forMe() { var me = answers.mlm_fe_for === "Me"; [].forEach.call(root.querySelectorAll("[data-q-me]"), function (h) {
    if (!h.hasAttribute("data-q-them")) h.setAttribute("data-q-them", h.textContent); h.textContent = me ? h.getAttribute("data-q-me") : h.getAttribute("data-q-them"); }); }
  function answer(sec, v) { answers[sec.getAttribute("data-qz")] = v; keep(); route(); forMe(); var i = screens.indexOf(sec) + 1; setTimeout(function () { to(screens[i]); }, 260); }

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".qz-opts button");
    if (b) {
      var sec = b.closest(".rl-p");
      [].forEach.call(sec.querySelectorAll(".qz-opts button"), function (x) { x.classList.toggle("is-picked", x === b); });
      if (b.hasAttribute("data-money-open")) { var f = sec.querySelector(".qz-money"); f.hidden = false; f.querySelector("input").focus(); return; }
      var m = sec.querySelector(".qz-money[data-or]"); if (m) m.hidden = true;
      answer(sec, b.getAttribute("data-v"));
      return;
    }
    var n = e.target.closest && e.target.closest(".qz-money button");
    if (n) { money(n.closest(".rl-p")); }
  });
  function money(sec) {
    var inp = sec.querySelector(".qz-money input"), v = String(inp.value || "").replace(/[^0-9]/g, "");
    if (!v || +v < 1) { inp.setAttribute("aria-invalid", "true"); inp.focus(); return; }
    inp.removeAttribute("aria-invalid");
    answer(sec, v);
  }
  root.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.closest && e.target.closest(".qz-money")) { e.preventDefault(); money(e.target.closest(".rl-p")); } });
  root.addEventListener("input", function (e) {
    if (!(e.target.closest && e.target.closest(".qz-money input"))) return;
    var d = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    e.target.value = d ? "$" + (+d).toLocaleString("en-US") : "";
  });

  function label(t) {
    var d = document.querySelector(".pfn-dock .pfn-txt b"); if (d && d.textContent !== t) d.textContent = t;
    var c = root.querySelector(".rl-cta"); if (c && c.textContent !== t) c.textContent = t;
  }
  function mark(i) { on = i; var s = screens[i]; root.classList.toggle("qz-in-q", s.hasAttribute("data-qz")); label(s === ready ? SEE : START); }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) mark(screens.indexOf(e.target)); }); }, { root: track, threshold: 0.6 });
  screens.forEach(function (s) { io.observe(s); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".pfn-dock, .ins-q .rl-cta");
    if (!t) return;
    var gap = missing();
    if (screens[on] === ready && !gap) { route(); keep(); return; }
    e.preventDefault(); e.stopImmediatePropagation();
    to(gap || qs[0]);
  }, true);

  var tries = 0;
  (function hook() { if (!document.querySelector(".pfn-dock")) { if (tries++ < 40) setTimeout(hook, 250); return; } mark(on); })();
})();
