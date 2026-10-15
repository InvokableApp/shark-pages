/* beneve/beneve-skin-diagnostic/b-skin-reel/result.js: the moves of the Skin Diagnostic's four result reels
 * (b-skin-*-result-reel), on top of _shared/reel/v1/reel.js.
 *   - A habit card opens a pop-up with the card again and its how-to (the GHL page's lines, kept in the card).
 *   - "Print or save this routine" prints every screen and every how-to (block.css @media print).
 *   - The dock ("View Recommended Products", the GHL page's sticky bar) and a computer's button go to the products screen,
 *     as the bar scrolled to them; a flick past the last screen does the same. The step has no form, so nothing else
 *     claims the dock. */
(function () {
  var root = document.querySelector(".rl-skr");
  if (!root) return;
  var track = root.querySelector(".rl-track");
  var stack = root.querySelector("#sk-stack");
  var pop = root.querySelector(".skr-pop"), body = pop.querySelector(".skr-pop-body"), last = null;

  function toStack() { if (stack) track.scrollTo({ top: stack.offsetTop, behavior: "smooth" }); }
  function shut() { pop.hidden = true; document.body.classList.remove("skr-pop-on"); body.innerHTML = ""; if (last) last.focus({ preventScroll: true }); last = null; }
  function open(card) {
    last = card;
    var c = card.cloneNode(true), more = c.querySelector(".skr-more");
    if (more) more.remove();
    c.removeAttribute("tabindex");
    body.innerHTML = c.innerHTML;
    pop.hidden = false; document.body.classList.add("skr-pop-on");
    pop.querySelector(".skr-pop-card").scrollTop = 0;
    pop.querySelector(".skr-pop-x").focus({ preventScroll: true });
  }

  root.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-sk-print]")) { e.preventDefault(); window.print(); return; }
    if (t.closest("[data-skr-stack]")) { e.preventDefault(); toStack(); return; }
    if (!pop.hidden) { if (t === pop || t.closest(".skr-pop-x")) shut(); return; }
    var card = t.closest(".skr-habit");
    if (card) open(card);
  });
  root.addEventListener("keydown", function (e) {
    var card = e.target.closest && e.target.closest(".skr-habit");
    if (card && e.target === card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(card); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) shut(); });

  // The phone's dock (drawn by the platform after this runs): a tap or a swipe goes to the products.
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); e.stopImmediatePropagation(); toStack(); }
  }, true);
  var tries = 0;
  (function hook() {
    var d = document.querySelector(".pfn-dock");
    if (!d) { if (tries++ < 40) setTimeout(hook, 250); return; }
    d.pfnSwipe = toStack;
  })();
})();
