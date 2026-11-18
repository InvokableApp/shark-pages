/* bepic/b-coffee-sample/b-coffee-sample-confirmation-reel (copied from GLP's ignyt-sample-confirmation-reel) — prints the rep's number the way people write it.
 * The platform fills bepic_rep_phone as +16095551234 (setup's {phone_e164}); a US number reads (609) 555-1234 in the words and
 * on the buttons. The sms: links keep the +1 form, which every phone dials. Anything that isn't a US number is left as is. */
(function () {
  [].forEach.call(document.querySelectorAll("[data-rep-phone]"), function (el) {
    var d = el.textContent.replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    if (d.length === 10) el.textContent = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  });
})();

/* ---------- the video: muted while its screen is on, a tap for sound (as the guide confirmations, b-coffees-teas) ---------- */
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
  v.addEventListener("click", function () { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
  v.addEventListener("ended", function () { v.muted = true; v.loop = true; screen.classList.remove("rlt-loud"); btn.setAttribute("aria-label", "Tap for sound"); v.currentTime = 0; sync(); });
})();
