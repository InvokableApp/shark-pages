/* beneve/beneve-skin-diagnostic/b-skin-reel/bonus.js: the claim on the four Skin Diagnostic result reels' bonus screens
 * (platform only; see bonus.css). COPIED from the Hormone Lunchbox bonus reel's block.js (itself word for word from the
 * Nueva confirmation reels), minus its dock handling: result.js owns the dock here and sends it to the bonus.
 * THE CLAIM IS A TAP, NEVER A SWIPE. The first tap on a [data-rl-claim-open] button opens the popup and fetches the step
 * named in data-rl-claim (/b-skin-guide-request) with the page's cookie and query, which the server counts as the known
 * lead viewing it; its automation tags them hot and texts and emails the rep with the text ready to send, once per lead.
 */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));

  // The rep, from the platform's data.
  var D = {}; try { D = JSON.parse((document.getElementById("pfn-data") || {}).textContent || "{}"); } catch (e) {}
  var rep = D.rep || {};
  // No rep name or picture on the card (Joe, 2026-10-21: "I don't think we should mention the person's names ... make
  // this feel like it's coming from the company"): it stays "Both sent to you by text".

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
  // The dock steps aside on the bonus screens, where the claim buttons are.
  // After the bonus (the close), the dock asks for the guide itself, and a tap claims it like the YES button (Jeff,
  // 2026-10-27: "Swipe up for a bonus" read wrong once the bonus was behind them).
  var bonusAt = -1; screens.forEach(function (s, i) { if (s.classList.contains("rlb")) bonusAt = i; });
  var before = null, AFTER = "Text me the free guide 🎁";
  function sync() {
    var dk = dock(), i = here(), s = screens[i]; var on = !!(s && s.classList.contains("rlb")); root.classList.toggle("on-bonus", on);
    if (!dk) return;
    if (!card.classList.contains("is-open")) dk.classList.toggle("pfn-gone", on);
    var b = dk.querySelector(".pfn-txt b"), after = bonusAt >= 0 && i > bonusAt;
    if (b && before === null) before = b.textContent;
    if (b) b.textContent = after ? AFTER : before;
    dk.classList.toggle("rl-dock-claim", after);
  }
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
    if (t.closest("[data-rl-claim-open]")) return open(e);
    if (t === card || t.closest("[data-claim-close]")) shut();
  });
  // result.js takes every dock tap to the bonus (document, capture); this one listens on window so it runs first.
  window.addEventListener("click", function (e) {
    var dk = e.target && e.target.closest && e.target.closest(".pfn-dock");
    if (dk && dk.classList.contains("rl-dock-claim")) { e.stopImmediatePropagation(); open(e); }
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
})();

