/* bepic/b-pre-workout-bar/b-pre-workout-bar-confirmation-reel (copied from bepic/b-greens-breakfast's, 2026-11-17, unchanged but this line): the confirmation reel's own moves (platform only; see
 * block.html). The reel's moves are _shared/reel/v1/reel.js; this adds THE BONUS FRAME (Jeff, 2026-10-20): the dock moves
 * to the bonus, only a button tap claims, and THE VIDEO on screen 2. Copied from n-tone-and-tighten-guide-confirmation-reel/block.js.
 *   THE VIDEO is the platform's video box (.qv, block.html): watch.js plays and reports it, reel.js pauseOff stops it
 *   when its screen is swiped away. Nothing here touches it.
 * ⚠️ The bonus code below is the same in the Tone and Tighten and No Crash Plan confirmation reels: change all three.
 */

/* ---------- the bonus frame: the dock moves, the buttons claim (Jeff, 2026-10-20) ---------- */
/* THE DOCK: the platform draws it from data-pf-dock ("Swipe up for a bonus 🎁", funnel-native.js) as a button that opens a
 * form. This page has no form: on the first screen its tap or swipe moves to the bonus (screen 2); from screen 2 on it
 * steps out of the way, because the claim buttons are on the screen. reel.js clicks it for a flick past the last screen,
 * and there it does nothing: THE CLAIM IS A TAP, NEVER A SWIPE, so scrolling to the end never alerts the rep.
 * THE CLAIM: the claim buttons ([data-rl-claim-open]) open the popup, and the first open fetches the request step named in
 * data-rl-claim with the page's own cookie (and its query, so a lead from a tracked email link is known too). The server
 * counts that as the known lead viewing the step (server.mjs contact_step_viewed), and its automation tags them hot and
 * texts and emails the rep (the funnel migration), once per lead. An anonymous visitor starts nothing.
 * THE NUMBER: the rep's own phone (bepic_rep_phone), checked the way the redirect-sms steps check it: anything with a letter
 * in it is the setup sentence, not a number, and then the "text ..." paragraph leaves the popup. A phone gets a tap-to-text
 * link with the word filled in; a computer gets the number as words.
 * THE COMPANY, NOT THE REP: the bonus card says "Sent to you in a message", with no rep name or picture (Joe,
 * 2026-10-21: a lead may not want "this person texting me, but like the company's cool"). The popup is CONFIRM.done, word for word. */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));

  // The rep, from the platform's data.
  var D = {}; try { D = JSON.parse((document.getElementById("pfn-data") || {}).textContent || "{}"); } catch (e) {}
  var rep = D.rep || {};
  // No rep name or picture on the card (Joe, 2026-10-21: "I don't think we should mention the person's names ... make
  // this feel like it's coming from the company"): it stays "Sent to you in a message".

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
