/* Vital / Minimalist GLP Guide / Opt In
   Two jobs:
   1. Alternate the highlight between Day A and Day B, so the page demonstrates the
      loop rather than describing it. Paused when the section is off screen and
      skipped entirely under prefers-reduced-motion.
   2. Both CTAs open the page's own GHL popup, which holds the opt-in form.
      `customWidgetOpenPopup` takes no argument, so nothing here is account-specific
      and the block survives a snapshot install (HOSTED-BLOCKS-SOP §7).
      Constraint: this page must carry exactly ONE popup. */
(function () {
  var root = document.querySelector(".sk-vital-vital-minimalist-glp-guide-optin[data-sk-optin]");
  if (!root || root.dataset.skWired) return;
  root.dataset.skWired = "1";

  root.querySelectorAll("[data-sk-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.dispatchEvent(new Event("customWidgetOpenPopup"));
    });
  });

  var days = root.querySelectorAll("[data-sk-day]");
  if (!days.length) return;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { days[0].setAttribute("data-sk-on", "1"); return; }

  var i = 0;
  var timer = null;
  var tick = function () {
    days.forEach(function (d, n) {
      if (n === i % days.length) d.setAttribute("data-sk-on", "1");
      else d.removeAttribute("data-sk-on");
    });
    i++;
  };
  var start = function () { if (!timer) { tick(); timer = setInterval(tick, 2600); } };
  var stop = function () { if (timer) { clearInterval(timer); timer = null; } };

  // Only run while the loop is actually on screen: an interval ticking in a
  // background tab is wasted work on a page that may sit open for a long time.
  var loop = root.querySelector("[data-sk-loop]");
  if (loop && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0.15 }).observe(loop);
  } else {
    start();
  }
})();
