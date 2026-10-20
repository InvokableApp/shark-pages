/* nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-confirmation-reel — the confirmation reel's own moves
 * (platform only; see block.html). The reel's moves are _shared/reel/v1/reel.js; this adds:
 *
 *   THE ASK (Jeff, 2026-10-20): every way in goes to the request step (below).
 *
 *   THE VIDEO (screen 2): plays muted while its screen is on, stops when it isn't (reel.js pauseOff stops it too), and a
 *   tap on "Tap for sound" starts it again from the top with sound. Reduced motion: it waits for the tap.
 */

/* ---------- the ask: the dock goes to the request step ---------- */
/* The dock is drawn by the platform from data-pf-dock (funnel-native.js) as a button that opens a form, and this page has
 * no form: its tap, its swipe (which clicks it) and a flick past the last screen (reel.js clicks it) go to the request
 * step named in data-rl-next instead, where the rep is alerted (migration 0427). The ask's button and the computer's
 * .rl-cta are plain links to the same step.
 * ⚠️ The same code is in nueva/n-no-crash-plan/n-no-crash-plan-confirmation-reel/block.js: change both. */
(function () {
  var root = document.querySelector("[data-rl-next]");
  if (!root) return;
  var next = root.getAttribute("data-rl-next");
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); location.href = next; }
  });
})();

/* ---------- the video: muted while its screen is on, a tap for sound ---------- */
(function () {
  var screen = document.querySelector(".rlt-vid"), v = screen && screen.querySelector("video"), btn = screen && screen.querySelector(".rlt-sound");
  if (!v || !btn) return;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function on() { return screen.classList.contains("is-on"); }
  function sync() {
    if (on()) { if (!still || !v.muted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
    else v.pause();
  }
  // reel.js marks the screen in view with .is-on.
  new MutationObserver(sync).observe(screen, { attributes: true, attributeFilter: ["class"] });
  btn.addEventListener("click", function () {
    if (v.muted) {
      v.muted = false; v.loop = false; v.currentTime = 0;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      screen.classList.add("rlt-loud"); btn.setAttribute("aria-label", "Mute");
    } else {
      v.muted = true; screen.classList.remove("rlt-loud"); btn.setAttribute("aria-label", "Tap for sound");
    }
  });
  // A tap on the picture pauses it or plays it on.
  v.addEventListener("click", function () { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
  v.addEventListener("ended", function () { v.muted = true; v.loop = true; screen.classList.remove("rlt-loud"); btn.setAttribute("aria-label", "Tap for sound"); v.currentTime = 0; sync(); });
})();
