/* mlm/mlm-caffeine-curve/mlm-caffeine-curve-result/result.js (Marketing Shark | MLM): fills in the number, the curve and
 * the claim. Runs BEFORE reel.js (block.html's script order): with no answers in the address the number screens leave the
 * page, so the reel never counts them. The claim is the wave 1 confirmation reels': a tap on a claim button fetches the
 * request step once (its view is the rep's alert) and opens the popup; the dock moves to the ask screen. */
(function () {
  var root = document.querySelector(".rl-ccr");
  if (!root || !window.mlmCaffeine) return;
  var C = window.mlmCaffeine;
  var q = {}; location.search.replace(/^\?/, "").split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
  var r = C.calc(q);
  var res = [].slice.call(root.querySelectorAll("[data-res]")), nores = [].slice.call(root.querySelectorAll("[data-nores]"));
  if (!r) {   // nothing to show: only the "take the check" state and the method stay
    res.forEach(function (el) { if (el.classList.contains("rl-p")) el.remove(); });
    root.removeAttribute("data-rl-claim");
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".pfn-dock")) { e.preventDefault(); e.stopImmediatePropagation(); location.href = "/mlm-caffeine-curve"; } }, true);
    var n = 0; (function hook() { var dk = document.querySelector(".pfn-dock"); if (!dk) { if (n++ < 40) setTimeout(hook, 250); return; } dk.pfnSwipe = function () { location.href = "/mlm-caffeine-curve"; }; var b = dk.querySelector(".pfn-txt b"); if (b) b.textContent = "Start the 5 question check"; })();
    return;
  }
  nores.forEach(function (el) { el.remove(); });
  var anyTime = r.cutoff == null || r.cutoff >= r.bed - 0.25;
  res.forEach(function (el) { if (anyTime && el.hasAttribute("data-cutoff-screen")) el.remove(); else el.hidden = false; });
  function put(sel, v) { [].forEach.call(root.querySelectorAll(sel), function (el) { el.textContent = v; }); }
  function fact(sel, big) { var el = root.querySelector(sel); if (el && el.firstChild) el.firstChild.nodeValue = big; }
  put("[data-mg]", String(r.value));
  var clears = r.clears == null ? "not today" : r.clears <= r.bed ? "before bed" : C.clock(r.clears);
  fact("[data-clears]", clears);
  if (r.clears != null && r.clears > r.bed && r.clears >= 24) put("[data-clears-k]", "finally clear, tomorrow");
  fact("[data-cutoff]", anyTime ? "any time" : C.clock(r.cutoff));
  fact("[data-per]", r.perDrink + " mg");
  put("[data-cutoff-big]", anyTime ? "" : C.clock(r.cutoff));
  var BANDS = {
    clear: ["Almost nothing is still working by the time you turn out the light",
      "On the timings you gave, caffeine isn't what's standing between you and a good night. If the afternoons still flatten you, something else is going on, and it's worth finding out what rather than blaming the coffee."],
    light: ["There's a little still working when you get into bed",
      "Not much, and for some people not enough to matter. Whether it does is something you find out by moving the last one earlier for a week and seeing what changes."],
    meaningful: ["That's a fair amount to be falling asleep on",
      "That's in the range of a black tea or most of a soda, at the moment you're trying to fall asleep. People at this sort of level in the study didn't report sleeping badly. Only the equipment saw it."],
    high: ["That's around the level the study measured",
      "It puts you close to the amount researchers used when people lost about an hour of sleep a night without noticing. And the afternoon drink doing most of it isn't there for pleasure. It's there because of the crash."]
  };
  var b = BANDS[r.band]; put("[data-band-head]", b[0]); put("[data-band-body]", b[1]);

  // The curve: your day (solid) and the same caffeine with the last drink at the cutoff (dashed), to two hours past bed.
  var svg = root.querySelector("[data-curve]");
  if (svg && r.series.length > 1) {
    var Wd = 340, Ht = 120, top = 10, base = 108, end = r.start + (r.series.length - 1) * r.step;
    var max = Math.max.apply(null, r.series.concat(r.shifted, [60]));
    var x = function (t) { return ((t - r.start) / (end - r.start)) * Wd; }, y = function (v) { return base - (v / max) * (base - top); };
    var path = function (arr) { return arr.map(function (v, i) { return (i ? "L" : "M") + x(r.start + i * r.step).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); };
    var bx = x(r.bed).toFixed(1);
    svg.innerHTML = '<line class="ax" x1="0" y1="' + base + '" x2="' + Wd + '" y2="' + base + '"/>' +
      '<line class="bed" x1="' + bx + '" y1="4" x2="' + bx + '" y2="' + base + '"/>' +
      (anyTime ? "" : '<path class="alt" d="' + path(r.shifted) + '"/>') + '<path class="ln" d="' + path(r.series) + '"/>';
    var lab = document.createElement("span"); lab.className = "ccr-bedlab"; lab.textContent = "bed " + r.clock.bed; lab.style.left = (x(r.bed) / Wd * 100) + "%";
    svg.parentNode.appendChild(lab);
    if (anyTime) { var k = root.querySelector(".ccr-k-alt"); if (k) k.parentNode.remove(); }
  }
})();

/* THE CLAIM AND THE DOCK (the wave 1 confirmation reels' block.js, unchanged in what it does). */
(function () {
  var root = document.querySelector("[data-rl-claim]"), card = document.querySelector("[data-rlt-claim]");
  if (!root || !card) return;
  var url = root.getAttribute("data-rl-claim"), sent = false, back = null;
  var track = root.querySelector(".rl-track");
  var ask = root.querySelector(".ccr-ask");

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
