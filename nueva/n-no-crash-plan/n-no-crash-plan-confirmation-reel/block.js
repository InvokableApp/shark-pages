/* nueva/n-no-crash-plan/n-no-crash-plan-confirmation-reel — the confirmation reel (platform only; see block.html).
 * The reel's moves are _shared/reel/v1/reel.js (block.html loads it); this adds the "Scroll" word on a computer, the typed
 * headline, and the bonus frame (Jeff, 2026-10-20): the dock moves to the bonus, only a button tap claims.
 * ⚠️ The bonus code below is the same in
 * nueva/n-tone-and-tighten-guide-funnel/n-tone-and-tighten-guide-confirmation-reel/block.js: change both. */

/* "Swipe for a bonus" under the buttons; a computer scrolls. */
(function () {
  var w = document.querySelector(".rlc-gift-word");
  if (w && !window.matchMedia("(pointer: coarse)").matches) w.textContent = "Scroll for a bonus";
})();

/* THE HEADLINE TYPES ITSELF OUT when the platform has put the visitor's first name in it, exactly as on the
 * scrolling confirmation: every letter in place from the start and revealed in turn, so nothing below moves. */
(function () {
  var h = document.querySelector(".rlc h1");
  if (!h || !h.querySelector(".pf-lead-name") || h.dataset.typed) return;
  h.dataset.typed = "1";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
  var letters = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n;
  while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(function (t) {
    var frag = document.createDocumentFragment();
    t.nodeValue.replace(/\s+/g, " ").split("").forEach(function (ch) {
      if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
      var s = document.createElement("span"); s.className = "tw-c"; s.textContent = ch;
      frag.appendChild(s); letters.push(s);
    });
    t.parentNode.replaceChild(frag, t);
  });
  h.classList.add("is-typing");
  var i = 0;
  setTimeout(function tick() {
    if (i) letters[i - 1].classList.remove("tw-cur");
    if (i >= letters.length) { h.classList.remove("is-typing"); return; }
    var s = letters[i++]; s.classList.add("tw-on", "tw-cur");
    var ch = s.textContent, next = letters[i] && letters[i].previousSibling;
    setTimeout(tick, ch === "." || ch === "," ? 260 : next && next.nodeType === 3 ? 60 : 42);
  }, 450);   // after the page has risen out of the cream
})();

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

/* ---------- THE VIDEO SPOT (screen 2): the still, or the video once block.html names one ---------- */
/* The spot's data-video-src is empty until there is a Nueva Beyond video; then the still is swapped for the video with
 * the same "Tap for sound" button as Tone and Tighten's, and the code below plays it. */
(function () {
  var box = document.querySelector(".rlb-vidbox[data-video-src]");
  var src = box && (box.getAttribute("data-video-src") || "").trim();
  if (!src) return;
  var screen = box.closest(".rl-p"), frame = box.querySelector(".rlt-video");
  var v = document.createElement("video");
  v.src = src; v.muted = true; v.loop = true; v.preload = "metadata";
  v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.setAttribute("aria-label", "The video");
  var poster = (box.getAttribute("data-video-poster") || "").trim(); if (poster) v.poster = poster;
  frame.classList.remove("rlb-still"); frame.textContent = ""; frame.appendChild(v);
  frame.insertAdjacentHTML("beforeend", '<button type="button" class="rlt-sound" aria-label="Tap for sound"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="rlt-x" d="m16 9 5 6m0-6-5 6"/><path class="rlt-w" d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"/></svg><span>Tap for sound</span></button>');
  screen.classList.add("rlt-vid");
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
