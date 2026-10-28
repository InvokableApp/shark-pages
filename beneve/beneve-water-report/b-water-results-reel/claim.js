/* beneve/beneve-water-report/b-water-results-reel/claim.js: the 3-Day Reset claim on the Water Report results reel
 * (platform only). COPIED from _shared/reel-bonus/v1/bonus.js (the popup, the first open's fetch, the rep's number),
 * except the dock: it says "Click here to request the FREE 3-Day Reset" and scrolls to the Reset screen (.wrr-blurb), whose
 * own button opens the popup. The dock is on every screen without a button of its own and off the two with one (the Reset
 * screen, the last), so there are never two asks at once (Jeff, 2026-10-28: "any screen that doesnt have a button should, as
 * long as its not redundant"). Once the Reset screen has been seen, the dock opens the popup itself instead of scrolling
 * back to it. A computer's floating button scrolls there too.
 * THE CLAIM IS A TAP, NEVER A SWIPE PAST THE END. reel.js clicks the dock for a flick past the last screen; that click is
 * not the person's (isTrusted false) and opens nothing, so scrolling to the end never alerts the rep.
 * The first open fetches the step named in data-rl-claim (/b-water-reset-request) with the page's cookie and query; the
 * server counts that as the known lead viewing it, and its automation tags them hot and texts, emails and buzzes the
 * rep with the text ready to copy, once per lead (migration 0529). An anonymous visitor starts nothing.
 * The rep's number: anything with a letter in it is the setup sentence, not a number, and then the "Text RESET"
 * paragraph leaves the popup. A phone gets a tap-to-text link with RESET filled in; a computer gets the number as words. */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlb-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;

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
    else { num.removeAttribute("href"); num.classList.add("rlb-claim-num-plain"); }
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
    var dk = dock(); if (dk) dk.classList.add("pfn-gone");
    requestAnimationFrame(function () { card.classList.add("is-open"); });
    var okBtn = card.querySelector(".rlb-claim-ok"); if (okBtn) setTimeout(function () { okBtn.focus({ preventScroll: true }); }, 50);
  }
  function shut() {
    if (card.hidden) return;
    card.classList.remove("is-open");
    setTimeout(function () { card.hidden = true; var dk = dock(); if (dk) dk.classList.toggle("pfn-gone", ownOn()); }, 300);
    if (back && back.focus) try { back.focus({ preventScroll: true }); } catch (x) {}
  }
  var blurb = document.querySelector(".wrr-blurb");
  function toReset() { if (blurb) blurb.scrollIntoView({ behavior: "smooth", block: "start" }); }
  // reel.js marks the screen in view with is-on. The screens with a button of their own put the dock away.
  var own = [].slice.call(document.querySelectorAll(".wrr-blurb, .wrr-ask")), reached = false;
  function ownOn() { return own.some(function (s) { return s.classList.contains("is-on"); }); }
  function sync() {
    if (blurb && blurb.classList.contains("is-on")) reached = true;
    var dk = dock(); if (dk && card.hidden) dk.classList.toggle("pfn-gone", ownOn());
  }
  if (window.MutationObserver) own.forEach(function (s) { new MutationObserver(sync).observe(s, { attributes: true, attributeFilter: ["class"] }); });
  // Window, capture: before the platform's dock handler (it opens a form, and this page has none).
  window.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest(".pfn-dock")) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.isTrusted) { if (reached) open(e); else toReset(); }
      return;
    }
    if (t.closest("[data-rl-goto-reset]")) { e.preventDefault(); e.stopImmediatePropagation(); return toReset(); }
    if (t.closest("[data-rl-claim-open]")) { e.stopImmediatePropagation(); return open(e); }
    if (t === card || t.closest("[data-claim-close]")) shut();
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
})();
