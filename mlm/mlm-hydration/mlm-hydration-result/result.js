/* mlm/mlm-hydration/mlm-hydration-result/result.js (Marketing Shark | MLM): fills in the number, and the claim.
 * Runs BEFORE reel.js (block.html's script order): with no answers in the address the number screens leave the page, so
 * the reel never counts them. The claim is the Greens at Breakfast confirmation reel's (wave 1): a tap on a claim button
 * fetches the request step once (its view is the rep's alert) and opens the popup; the dock moves to the ask screen. */
(function () {
  var root = document.querySelector(".rl-hyr");
  if (!root || !window.mlmHydration) return;
  var q = {}; location.search.replace(/^\?/, "").split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
  var r = window.mlmHydration.calc(q);
  var res = [].slice.call(root.querySelectorAll("[data-res]")), nores = [].slice.call(root.querySelectorAll("[data-nores]"));
  if (!r) {   // nothing to show: only the "take the check" state and the method stay
    res.forEach(function (el) { if (el.classList.contains("rl-p")) el.remove(); });
    root.setAttribute("data-pf-dock", "Start the 4 question check");
    root.removeAttribute("data-rl-claim");
    root.classList.add("hyr-none");
    // The dock (and a flick past the end) goes to the check.
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); e.stopImmediatePropagation(); location.href = "/mlm-hydration"; } }, true);
    var n = 0; (function hook() { var dk = document.querySelector(".pfn-dock"); if (!dk) { if (n++ < 40) setTimeout(hook, 250); return; } dk.pfnSwipe = function () { location.href = "/mlm-hydration"; }; })();
    return;
  }
  nores.forEach(function (el) { el.remove(); });
  res.forEach(function (el) { el.hidden = false; });
  function put(sel, v) { [].forEach.call(root.querySelectorAll(sel), function (el) { el.textContent = v; }); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function bottles(b) { return b === 1 ? "1 bottle" : (String(b).replace(/\.5$/, "½")) + " bottles"; }
  put("[data-n]", fmt(r.need)); put("[data-n2]", fmt(r.need)); put("[data-i]", fmt(r.drink));
  put("[data-nb]", String(r.needBottles).replace(/\.5$/, "½"));
  var fill = root.querySelector("[data-fill]"); if (fill) fill.style.setProperty("--p", Math.min(100, r.pct) + "%");
  var bar = root.querySelector("[data-bar-label]"); if (bar) bar.setAttribute("aria-label", "You drink about " + r.drink + " oz of the " + r.need + " oz a day like that uses");
  var BANDS = {
    close: ["You're already drinking about what a day like that uses",
      "Nothing here says to change anything. The thing worth knowing is that on the hottest and hardest days, what you lose isn't only water. It's sodium, potassium and magnesium, and plain water puts back one of those. That's the gap an electrolyte drink is made for, and why a lot of people keep one for the hard days rather than every day."],
    short: ["You're about " + bottles(r.gapBottles) + " short on a day like that",
      "That's a common gap and an easy one to close. Most of it is habit: a bottle that goes with you, a drink before you head out rather than after. Worth knowing too: on hot and hard days what you lose isn't only water. It's sodium, potassium and magnesium, and plain water only puts back the water."],
    well: ["That's a gap of about " + bottles(r.gapBottles),
      "On a day like that, it's a real difference, and it's worth a word with your doctor before you change much on the strength of a quiz. What's useful to know: heavy, hot days don't only cost water. They cost sodium, potassium and magnesium, and water on its own puts back the water."]
  };
  var b = BANDS[r.band] || BANDS.short;
  put("[data-band-head]", b[0]); put("[data-band-body]", b[1]);
  put("[data-na]", fmt(r.sodium));
  put("[data-salt-line]", r.sodium
    ? "That's about how much leaves in " + (r.sweatL === 1 ? "a liter" : r.sweatL + " liters") + " of sweat on a day like that, about " + r.salt + " of salt."
    : "On a day without much sweat, very little leaves, and food usually covers it. On the days you do sweat, this is the number that goes up.");
})();

/* THE CLAIM AND THE DOCK (the wave 1 confirmation reels' block.js, unchanged in what it does). */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;
  var track = root.querySelector(".rl-track");
  var ask = root.querySelector(".hyr-ask");

  // The rep's number: tap to text on a phone, plain words on a computer, the paragraph gone when none is set.
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

  function toAsk() { if (ask && track) track.scrollTo({ top: ask.offsetTop, behavior: "smooth" }); }
  function dock() { return document.querySelector(".pfn-dock"); }
  // The dock shows until the ask screen is reached.
  function sync() { var dk = dock(); if (dk && ask && !card.classList.contains("is-open")) dk.classList.toggle("pfn-gone", track.scrollTop >= ask.offsetTop - 40); }
  if (track) track.addEventListener("scroll", sync, { passive: true });

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
    if (t.closest(".pfn-dock")) { e.preventDefault(); e.stopImmediatePropagation(); toAsk(); return; }
    if (t.closest("[data-rl-claim-open]")) return open(e);
    if (t === card || t.closest("[data-claim-close]")) shut();
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });
  var tries = 0;
  (function hook() {
    var dk = dock();
    if (!dk) { if (tries++ < 40) setTimeout(hook, 250); return; }
    dk.pfnSwipe = toAsk; sync();
  })();
})();
