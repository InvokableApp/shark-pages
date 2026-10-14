/* glp / what-weight-loss-is-best-for-you-interactive-funnel / products-info-reel — GLP's Sizzle page as a reel (platform
 * only; see block.html). The reel's moves are _shared/reel/v1/reel.js (loaded by block.html). This adds:
 *
 *   1. THE BUTTONS GO TO THE REP'S SHOP (rep_buy_link, root data-gz-shop), or with none on file to THIS FUNNEL'S DM STEP. One page serves two funnels (/sizzle and /products-info), each with its
 *      own redirect step to the rep's Messenger; the root's data-gz-dm names them ("/sizzle=/sizzle-redirect ...").
 *      The in-screen buttons and the computer's floating button get that address; the phone's dock (drawn by the
 *      platform, funnel-native.js) is sent there on a tap or a swipe. Only while the step has no form: with one,
 *      form.js owns every [data-optin] and the dock, and opens it as on any opt-in.
 *   2. THE VIDEO's still (watch.js makes the player after this runs).
 *   3. EACH SCREEN FITS ITS PHONE: a screen that would run into the dock is shrunk a little (its words are sized in em,
 *      never below 82% on a phone, 74% on a very short one, 72% in a short computer window); the comparison table and the FAQ then scroll inside their own box ([data-gz-box]).
 *   4. The numbers count up the first time their screen comes in; the FAQ opens one answer at a time.
 */
(function () {
  var root = document.querySelector(".rl.gz");
  if (!root || root.dataset.gzOn) return;
  root.dataset.gzOn = "1";

  /* ---- 1. the DM step ---- */
  var here = location.pathname.replace(/\/+$/, "") || "/";
  var dm = "/sizzle-redirect";
  String(root.getAttribute("data-gz-dm") || "").split(/\s+/).forEach(function (pair) {
    var kv = pair.split("=");
    if (kv.length === 2 && here.slice(-kv[0].length) === kv[0]) dm = kv[1];
  });
  // The product buttons go to the rep's own shop (rep_buy_link, Jeff 2026-10-14: "can we make that go to reps replicated
  // link?"), the science link stays on the DM step. No shop link on file (or a placeholder that didn't fill): the DM step.
  var shop = String(root.getAttribute("data-gz-shop") || "").trim();
  if (!shop || shop.indexOf("{{") > -1) shop = "";
  else if (!/^https?:\/\//i.test(shop)) shop = "https://" + shop;
  var go = shop || dm;
  [].forEach.call(root.querySelectorAll("[data-gz-go]"), function (a) { a.setAttribute("href", a.getAttribute("data-gz-go") === "dm" ? dm : go); });
  var hasForm = function () { return !!(window.__PF__ && (window.__PF__.form || window.__PF__.survey)); };
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".pfn-dock");
    if (!d || hasForm()) return;
    e.preventDefault();
    location.href = go;
  }, true);

  /* ---- 2. the video's still ---- */
  var box = root.querySelector(".gz-video"), tries = 0;
  (function hook() {
    var v = box && box.querySelector("video");
    if (!v) { if (box && tries++ < 40) setTimeout(hook, 250); return; }
    var poster = box.getAttribute("data-poster");
    if (poster) v.poster = poster;
    v.setAttribute("playsinline", "");
  })();

  /* ---- 3. every screen fits ---- */
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  function fitOne(p) {
    var inner = p.querySelector(".rl-in");
    if (!inner) return;
    var boxes = [].slice.call(inner.querySelectorAll("[data-gz-box]"));
    boxes.forEach(function (b) { b.style.maxHeight = ""; });
    var f = 1, min = innerWidth > 700 ? 0.72 : innerHeight < 620 ? 0.74 : 0.82;
    inner.style.setProperty("--gz-f", f);
    while (inner.offsetHeight > p.clientHeight + 1 && f > min) {
      f = Math.round((f - 0.03) * 100) / 100;
      inner.style.setProperty("--gz-f", f);
    }
    boxes.forEach(function (b) {
      var room = p.clientHeight - (inner.offsetHeight - b.offsetHeight);
      if (b.getAttribute("data-gz-box") === "always" || inner.offsetHeight > p.clientHeight + 1) b.style.maxHeight = Math.max(140, room) + "px";
    });
  }
  function fitAll() { screens.forEach(fitOne); }
  var t = null;
  function soon() { clearTimeout(t); t = setTimeout(fitAll, 120); }
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("load", fitAll);
  window.addEventListener("resize", soon);

  /* ---- 4a. the numbers count up, once ---- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function count(el) {
    var to = Number(el.getAttribute("data-gz-count")), suf = el.getAttribute("data-gz-suffix") || "", t0 = null;
    var fmt = function (n) { return (to >= 1000 ? n.toLocaleString("en-US") : String(n)) + suf; };
    function step(ts) {
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        [].forEach.call(e.target.querySelectorAll("[data-gz-count]"), count);
      });
    }, { root: root.querySelector(".rl-track"), threshold: 0.6 });
    screens.forEach(function (s) { if (s.querySelector("[data-gz-count]")) io.observe(s); });
  }

  /* ---- 4b. the FAQ: one answer at a time, kept in view inside its box ---- */
  var faq = root.querySelector(".gz-faq");
  if (faq) [].forEach.call(faq.querySelectorAll("details"), function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      [].forEach.call(faq.querySelectorAll("details[open]"), function (o) { if (o !== d) o.open = false; });
      setTimeout(function () { faq.scrollTo({ top: Math.max(0, d.offsetTop - faq.offsetTop - 4), behavior: "smooth" }); }, 30);
    });
  });
})();
