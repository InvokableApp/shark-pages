/* mpg/m-feed-your-gut/m-feed-your-gut-confirmation-reel: the confirmation reel (platform only; see block.html).
 * The reel's moves are _shared/reel/v1/reel.js (block.html loads it). This adds the "Scroll" word on a computer, the
 * bonus frame and the video spot. Nueva's No Crash Plan confirmation (n-no-crash-plan-confirmation-reel/block.js) is the
 * same pattern; copied from the Vagus Nerve Reset's confirmation (mpg/m-vagus-reset/m-vagus-reset-confirmation-reel).
 * Every lookup is guarded: a throw here would take the platform's own scripts down with it. */

/* "Swipe for a bonus" under the buttons; a computer scrolls. */
(function () {
  var w = document.querySelector(".rl-farm .rl-gift-word");
  if (w && !window.matchMedia("(pointer: coarse)").matches) w.textContent = "Scroll for a bonus";
})();

/* ---------- the bonus frame: the dock moves, the buttons claim ---------- */
/* THE DOCK: the platform draws it from data-pf-dock ("Swipe up for a bonus 🎁", funnel-native.js) as a button that opens a
 * form. This page has no form: on the first screen its tap moves to the bonus (screen 2); from screen 2 on it steps out of
 * the way, because the claim buttons are on the screen. reel.js clicks it for a flick past the last screen, and there it
 * does nothing: THE CLAIM IS A TAP, NEVER A SWIPE, so scrolling to the end never alerts the rep.
 * THE CLAIM: the claim buttons ([data-cf-claim-open]) open the popup, and the first open fetches the bonus step named in
 * data-cf-claim-url with the page's own cookie (and its query, so a lead from a tracked email link is known too). The
 * server counts that as the known lead viewing the step (server.mjs contact_step_viewed), and its automation tags them hot
 * and texts and emails the rep, once per lead. An anonymous visitor starts nothing.
 * THE NUMBER: the rep's own phone (mpg_rep_phone). Anything with a letter in it is the setup sentence, not a number, and
 * then the "text GUT" paragraph leaves the popup. A phone gets a tap-to-text link with GUT filled in; a computer gets the
 * number as words (an sms: link opens nothing there). */
(function () {
  var root = document.querySelector("[data-cf-claim-url]"), card = document.querySelector("[data-cf-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-cf-claim-url"), sent = false, back = null;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));

  var num = card.querySelector("[data-cf-num]"), para = card.querySelector("[data-cf-sms]");
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
    else { num.removeAttribute("href"); num.classList.add("cf-num-plain"); }
  }

  function here() {   // the screen in view
    var t = track ? track.scrollTop : 0, best = 0;
    screens.forEach(function (s, i) { if (Math.abs(s.offsetTop - t) < Math.abs(screens[best].offsetTop - t)) best = i; });
    return best;
  }
  function dock() { return document.querySelector(".pfn-dock"); }
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
    var okBtn = card.querySelector(".cf-ok"); if (okBtn) setTimeout(function () { okBtn.focus({ preventScroll: true }); }, 50);
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
    if (t.closest("[data-cf-claim-open]")) return open(e);
    if (t === card || t.closest("[data-cf-close]")) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
})();

/* ---------- THE VIDEO SPOT: the still, or the video once block.html names one ---------- */
/* Muted while its screen is on (reel.js marks it .is-on), paused when swiped away, "Tap for sound" to hear it. */
(function () {
  var box = document.querySelector(".cf-video[data-video-src]");
  var src = box && (box.getAttribute("data-video-src") || "").trim();
  if (!src) return;
  var screen = box.closest(".rl-p"), btn = box.querySelector(".cf-sound");
  var v = document.createElement("video");
  v.src = src; v.muted = true; v.loop = true; v.preload = "metadata";
  v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.setAttribute("aria-label", "The video");
  var poster = (box.getAttribute("data-video-poster") || "").trim(); if (poster) v.poster = poster;
  box.insertBefore(v, box.firstChild); box.classList.add("is-playing");
  if (btn && btn.tagName !== "BUTTON") { var b = document.createElement("button"); b.type = "button"; b.className = btn.className; b.textContent = btn.textContent; btn.replaceWith(b); btn = b; }
  function sync() { if (screen.classList.contains("is-on")) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
  new MutationObserver(sync).observe(screen, { attributes: true, attributeFilter: ["class"] });
  if (btn) btn.addEventListener("click", function () {
    v.muted = !v.muted;
    if (!v.muted) { v.loop = false; v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    btn.textContent = v.muted ? "🔇 Tap for sound" : "🔊 Mute";
  });
  v.addEventListener("ended", function () { v.muted = true; v.loop = true; v.currentTime = 0; if (btn) btn.textContent = "🔇 Tap for sound"; sync(); });
})();
