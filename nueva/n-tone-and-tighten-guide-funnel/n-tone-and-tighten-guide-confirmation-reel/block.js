/* nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-confirmation-reel — the confirmation reel's own moves
 * (platform only; see block.html). The reel's moves are _shared/reel/v1/reel.js; this adds:
 *
 *   THE BONUS FRAME (Jeff, 2026-10-20): the dock moves to the bonus, only a button tap claims (below).
 *
 *   THE VIDEO (screen 2): plays muted while its screen is on, stops when it isn't (reel.js pauseOff stops it too), and a
 *   tap on "Tap for sound" starts it again from the top with sound. Reduced motion: it waits for the tap.
 *
 * ⚠️ The bonus code below is the same in nueva/n-no-crash-plan/n-no-crash-plan-confirmation-reel/block.js: change both.
 */

/* ---------- the bonus frame: the dock moves, the buttons claim (Jeff, 2026-10-20) ---------- */
/* THE DOCK: the platform draws it from data-pf-dock ("Swipe up for a bonus 🎁", funnel-native.js) as a button that opens a
 * form. This page has no form: on the first screen its tap or swipe moves to the bonus (screen 2); from screen 2 on it
 * steps out of the way, because the claim buttons are on the screen. reel.js clicks it for a flick past the last screen,
 * and there it does nothing: THE CLAIM IS A TAP, NEVER A SWIPE, so scrolling to the end never alerts the rep.
 * THE CLAIM: the claim buttons ([data-rl-claim-open]) open the popup, and the first open fetches the request step named in
 * data-rl-claim with the page's own cookie (and its query, so a lead from a tracked email link is known too). The server
 * counts that as the known lead viewing the step (server.mjs contact_step_viewed), and its automation tags them hot and
 * texts and emails the rep (migration 0427), once per lead. An anonymous visitor starts nothing.
 * THE NUMBER: the rep's own phone (nueva_rep_phone), checked the way the redirect-sms steps check it: anything with a letter
 * in it is the setup sentence, not a number, and then the "text ..." paragraph leaves the popup. A phone gets a tap-to-text
 * link with the word filled in; a computer gets the number as words.
 * THE REP: "Texted to you by {first}" with their picture on the coupon card (#pfn-data, made on the server and escaped
 * there), so "I" and "we" have a face. No name: the card says "Both sent to you by text". */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));

  // The rep, from the platform's data.
  var D = {}; try { D = JSON.parse((document.getElementById("pfn-data") || {}).textContent || "{}"); } catch (e) {}
  var rep = D.rep || {};
  if (rep.first) [].forEach.call(root.querySelectorAll("[data-rep-by]"), function (el) { el.textContent = "Texted to you by " + rep.first; });
  if (rep.pic) [].forEach.call(root.querySelectorAll("[data-rep-pic]"), function (el) { el.innerHTML = rep.pic; el.hidden = false; });

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
    if (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches)
      num.setAttribute("href", "sms:" + e164 + "?&body=" + encodeURIComponent(num.getAttribute("data-word") || ""));
    else { num.removeAttribute("href"); num.classList.add("rlt-claim-num-plain"); }
  }

  function here() {   // the screen in view
    var t = track ? track.scrollTop : 0, best = 0;
    screens.forEach(function (s, i) { if (Math.abs(s.offsetTop - t) < Math.abs(screens[best].offsetTop - t)) best = i; });
    return best;
  }
  function dock() { return document.querySelector(".pfn-dock"); }
  // The dock shows on the first screen only.
  function sync() { var dk = dock(); if (dk && !card.classList.contains("is-open")) dk.classList.toggle("pfn-gone", here() > 0); }
  if (track) track.addEventListener("scroll", sync, { passive: true });
  setTimeout(sync, 500);

  function open(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!sent) {
      sent = true;
      try { fetch(url + location.search, { credentials: "same-origin", cache: "no-store", keepalive: true }).catch(function () {}); } catch (x) {}
    }
    back = document.activeElement;
    card.hidden = false;
    requestAnimationFrame(function () { card.classList.add("is-open"); });
    var okBtn = card.querySelector(".rlt-claim-ok"); if (okBtn) setTimeout(function () { okBtn.focus({ preventScroll: true }); }, 50);
  }
  function shut() {
    if (card.hidden) return;
    card.classList.remove("is-open");
    setTimeout(function () { card.hidden = true; }, 300);
    if (back && back.focus) try { back.focus({ preventScroll: true }); } catch (x) {}
  }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest(".pfn-dock")) {
      e.preventDefault();
      if (here() === 0 && screens[1] && track) track.scrollTo({ top: screens[1].offsetTop, behavior: "smooth" });
      return;
    }
    if (t.closest("[data-rl-claim-open]")) return open(e);
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
