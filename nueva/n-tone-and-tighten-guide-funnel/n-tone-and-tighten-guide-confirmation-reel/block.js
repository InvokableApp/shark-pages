/* nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-confirmation-reel — the confirmation reel's own moves
 * (platform only; see block.html). The reel's moves are _shared/reel/v1/reel.js; this adds:
 *
 *   THE CLAIM (Joe, 2026-10-20): every way in opens the claim card on this page and, once, alerts the rep (below).
 *
 *   THE VIDEO (screen 2): plays muted while its screen is on, stops when it isn't (reel.js pauseOff stops it too), and a
 *   tap on "Tap for sound" starts it again from the top with sound. Reduced motion: it waits for the tap.
 */

/* ---------- the claim: every button opens the card, and the first open alerts the rep ---------- */
/* Joe, 2026-10-20: "just modify the confirmation page to do this ... the popup comes up ... dont need the other page".
 * The dock is drawn by the platform from data-pf-dock (funnel-native.js) as a button that opens a form, and this page has
 * no form: its tap, its swipe (which clicks it) and a flick past the last screen (reel.js clicks it) open the card here,
 * as do the ask screen's button and the computer's .rl-cta ([data-rl-claim-open], whose hrefs stay for a page with no
 * script).
 * THE ALERT: the first open fetches the request step named in data-rl-claim, with the page's own cookie (and its query,
 * so a lead who came from a tracked email link is known too). The server counts that as the known lead viewing the step
 * (server.mjs contact_step_viewed), and its automation tags them hot and texts and emails the rep (migration 0427), once
 * per lead. An anonymous visitor starts nothing, as on the page itself.
 * THE NUMBER: the rep's own phone (nueva_rep_phone), checked the way the redirect-sms step checks it: anything with a
 * letter in it is the setup sentence, not a number, and then the "text DISCOUNT" paragraph leaves the card. A phone gets
 * a tap-to-text link with DISCOUNT filled in; a computer gets the number as words.
 * ⚠️ nueva/n-no-crash-plan/n-no-crash-plan-confirmation-reel/block.js still sends its dock to its request page. */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;

  // The rep's number.
  var num = card.querySelector("[data-claim-num]"), para = card.querySelector("[data-claim-sms]");
  var raw = (num ? num.textContent : "").trim();
  var ok = raw !== "" && !/[A-Za-z{}]/.test(raw) && /^\+?[\d\s().-]+$/.test(raw);
  var d = ok ? raw.replace(/\D/g, "") : "";
  var e164 = raw.charAt(0) === "+" ? "+" + d : d.length === 10 ? "+1" + d : d.length === 11 && d.charAt(0) === "1" ? "+" + d : d;
  if (d.length < 10) { if (para) para.remove(); }
  else if (num) {
    var us = /^\+1\d{10}$/.test(e164) ? e164.slice(2) : "";
    num.textContent = us ? "(" + us.slice(0, 3) + ") " + us.slice(3, 6) + "-" + us.slice(6) : e164;
    if (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches) num.setAttribute("href", "sms:" + e164 + "?&body=DISCOUNT");
    else { num.removeAttribute("href"); num.classList.add("rlt-claim-num-plain"); }
  }

  function dock() { return document.querySelector(".pfn-dock"); }
  function open(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!sent) {
      sent = true;
      try { fetch(url + location.search, { credentials: "same-origin", cache: "no-store", keepalive: true }).catch(function () {}); } catch (x) {}
    }
    back = document.activeElement;
    card.hidden = false;
    requestAnimationFrame(function () { card.classList.add("is-open"); });
    var dk = dock(); if (dk) dk.classList.add("pfn-gone");
    var okBtn = card.querySelector(".rlt-claim-ok"); if (okBtn) setTimeout(function () { okBtn.focus({ preventScroll: true }); }, 50);
  }
  function shut() {
    if (card.hidden) return;
    card.classList.remove("is-open");
    var dk = dock(); if (dk) dk.classList.remove("pfn-gone");
    setTimeout(function () { card.hidden = true; }, 300);
    if (back && back.focus) try { back.focus({ preventScroll: true }); } catch (x) {}
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest(".pfn-dock") || t.closest("[data-rl-claim-open]")) return open(e);
    if (t === card || t.closest("[data-claim-close]")) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
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
