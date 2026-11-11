/* glp/glp-real-results/real-results-reel: the cover's faces jump to the gallery (screen 6), and a "Swipe up" prompt at the
 * bottom of every screen but the last (Jeff, 2026-11-11: "lets ad swipe prompts to the bottom of the pages"). Phone only
 * (CSS); a computer has the arrows. Everything else is reel.js. */
(function () {
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-jump]");
    if (!b) return;
    var t = document.getElementById(b.getAttribute("data-jump"));
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  var screens = document.querySelectorAll(".rr .rl-p");
  var arrow = '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';
  for (var i = 0; i < screens.length - 1; i++)
    screens[i].insertAdjacentHTML("beforeend", '<div class="rr-swipe" aria-hidden="true"><span>' + arrow + arrow + '</span><b>Swipe up</b></div>');
})();
