/* mpg/m-feed-your-gut/m-feed-your-gut-reel: the plant points screen (see block.html). 30 dots fill one by one and
 * the number counts up with them each time the screen comes on (reel.js marks it .is-on); reduced motion shows 30.
 * Every lookup is guarded: a throw here would take the platform's own scripts down with it. */
(function () {
  var dots = document.querySelector(".fy-dots"), num = document.querySelector("[data-count]"); if (!dots || !num) return; var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (var i = 0; i < 30; i++) { var d = document.createElement("i"); d.style.transitionDelay = (0.3 + i * 0.05) + "s"; dots.appendChild(d); }
  var screen = num.closest(".rl-p"), t;
  function run() {
    clearInterval(t);
    if (still) { num.textContent = "30"; return; }
    var n = 0; num.textContent = "0";
    setTimeout(function () { t = setInterval(function () { n++; num.textContent = n; if (n >= 30) clearInterval(t); }, 50); }, 300);
  }
  new MutationObserver(function () { if (screen.classList.contains("is-on")) run(); }).observe(screen, { attributes: true, attributeFilter: ["class"] });
})();
