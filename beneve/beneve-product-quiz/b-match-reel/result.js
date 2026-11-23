/* beneve/beneve-product-quiz/b-match-reel/result.js: the four result reels' one move, on top of _shared/reel/v1/reel.js.
 * The bottom button (the phone's dock, a computer's .rl-cta) says the next useful thing for the screen they are on
 * (Jeff, 2026-11-17: "change the button to make more sense"; it said "See my picks" on every screen):
 *   1. the match       "See my picks"           goes to the products screen
 *   2. the products    "Questions? Text me"     opens a text to the rep (the same link as the last screen's button)
 *   3. questions first  hidden                  that screen's own "Text me with questions" button is the one action
 * The step has no form, so nothing else claims the dock. */
(function () {
  var root = document.querySelector(".rl-bqr");
  if (!root) return;
  // The page's language (platform page-words, window.__pfWords): English when none are sent.
  function W(k, d) { var w = window.__pfWords; return (w && w[k]) || d; }
  var track = root.querySelector(".rl-track"), picks = root.querySelector("#bq-picks");
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var textLink = root.querySelector(".bq-text"), cta = root.querySelector(".rl-cta");
  var first = cta ? cta.textContent : "See my picks";
  var mode = "picks", dock = null;

  function toPicks() { if (picks) track.scrollTo({ top: picks.offsetTop, behavior: "smooth" }); }
  function textMe() { if (textLink) location.href = textLink.getAttribute("href"); }
  function go() { if (mode === "text") textMe(); else if (mode === "picks") toPicks(); }

  function paint() {
    var i = screens.findIndex(function (s) { return s.classList.contains("is-on"); });
    mode = i <= 0 ? "picks" : screens[i] === picks ? "text" : "none";
    var label = mode === "text" ? W("beneve.pq_questions", "Questions? Message me") : first;
    if (cta) {
      cta.textContent = label;
      cta.setAttribute("href", mode === "text" && textLink ? textLink.getAttribute("href") : "#bq-picks");
      cta.style.visibility = mode === "none" ? "hidden" : "";
    }
    if (dock) {
      var b = dock.querySelector(".pfn-txt b"); if (b) b.textContent = label;
      dock.classList.toggle("pfn-gone", mode === "none");
    }
  }

  root.addEventListener("click", function (e) {
    if (e.target.closest("[data-bq-picks]")) { e.preventDefault(); go(); }
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); e.stopImmediatePropagation(); go(); }
  }, true);
  var mo = new MutationObserver(paint);
  screens.forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ["class"] }); });
  var tries = 0;
  (function hook() {
    dock = document.querySelector(".pfn-dock");
    if (!dock) { if (tries++ < 40) setTimeout(hook, 250); return; }
    dock.pfnSwipe = go;
    paint();
  })();
  paint();
})();
