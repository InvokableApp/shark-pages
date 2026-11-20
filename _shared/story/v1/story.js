/* _shared/story/v1/story.js — the PRODUCT STORY kit's moves (with story.css), on top of reel.js (which marks the screen in
 * view .is-on). Written in the page after reel.js: <script src="/_p/_shared/story/v1/story.js?v=N" defer>.
 *   [data-st-rep]          the rep's first name (the platform's #pfn-data); the banner shows "Sent to you by ..."
 *   [data-st-more="key"]   opens the sheet, filled from <template data-st-for="key">. watch.js tells the rep (its data-label)
 *   [data-st-play="key"]   opens the pop-up [data-st-pop="key"] and plays its video (watch.js builds the player, reports it)
 *   [data-st-go="key"]     closes the sheet and moves to the screen with id "key"
 *   [data-count]           counts up to its number when its screen comes on
 *   [data-st-copy]         copies the words in its data-st-copy (the message to send the rep), says "Copied"
 *   .rl-p (all but last)   gets a "Swipe up" hint at its foot that moves on when tapped */
(function () {
  var root = document.querySelector(".st");
  if (!root || root.dataset.stOn) return;
  root.dataset.stOn = "1";
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  function fillRep(scope) { if (first) [].forEach.call(scope.querySelectorAll("[data-st-rep]"), function (s) { s.textContent = first; }); }
  fillRep(root);
  var banner = root.querySelector(".st-banner");
  if (banner && first) {
    var pic = banner.querySelector(".st-banner-pic");
    if (d.rep.pic) pic.innerHTML = d.rep.pic; else pic.remove();
    banner.hidden = false; root.classList.add("st-has-banner");
  }
  var track = root.querySelector(".rl-track");
  function goTo(el) { if (track && el) track.scrollTo({ top: el.offsetTop, behavior: "smooth" }); }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  // The swipe hint at the foot of every screen but the last.
  var touchy = window.matchMedia("(pointer: coarse)").matches;
  var screens = [].slice.call(root.querySelectorAll(".rl-p"));
  screens.slice(0, -1).forEach(function (sc) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "st-swipe"; b.setAttribute("aria-label", "Next screen"); b.setAttribute("data-pf-quiet", "");
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>' + (touchy ? "Swipe up" : "Scroll");
    b.addEventListener("click", function () { goTo(sc.nextElementSibling); });
    sc.appendChild(b);
  });

  // Counts.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  [].forEach.call(root.querySelectorAll("[data-count]"), function (el) {
    var to = Number(el.getAttribute("data-count")), screen = el.closest(".rl-p"), raf = 0, suffix = el.getAttribute("data-suffix") || "";
    function show(v) { el.textContent = Math.round(v).toLocaleString("en-US") + suffix; }
    if (reduce || !screen) return show(to);
    var was = false;
    show(0);
    function run() {
      var on = screen.classList.contains("is-on");
      if (on === was) return;
      was = on; cancelAnimationFrame(raf);
      if (!on) return;
      var t0 = performance.now() + 300, len = 1400;
      (function step(t) { var p = Math.max(0, Math.min(1, (t - t0) / len)); show(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); })(t0);
    }
    new MutationObserver(run).observe(screen, { attributes: true, attributeFilter: ["class"] });
    run();
  });

  // THE SHEET.
  var sheet = root.querySelector(".st-sheet"), body = sheet && sheet.querySelector(".st-sheet-body"), lastFocus = null;
  function openSheet(key, from) {
    var t = root.querySelector('template[data-st-for="' + key + '"]');
    if (!t || !sheet) return;
    body.innerHTML = ""; body.appendChild(t.content.cloneNode(true)); fillRep(body); body.scrollTop = 0;
    var h = body.querySelector("h3"); if (h) { h.id = "st-sheet-h"; sheet.setAttribute("aria-labelledby", "st-sheet-h"); }
    lastFocus = from || null;
    sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add("is-open"); });
    var x = sheet.querySelector(".st-sheet-x"); if (x) x.focus({ preventScroll: true });
    buzz(10);
  }
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove("is-open");
    setTimeout(function () { sheet.hidden = true; body.innerHTML = ""; }, reduce ? 0 : 250);
    if (lastFocus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  // POP-UPS (a video or a picture).
  var openPop = null;
  function shut() { if (!openPop) return; openPop.hidden = true; var v = openPop.querySelector("video"); if (v) v.pause(); openPop = null; }

  root.addEventListener("click", function (e) {
    var t = e.target;
    var more = t.closest && t.closest("[data-st-more]");
    if (more) { e.preventDefault(); openSheet(more.getAttribute("data-st-more"), more); return; }
    var play = t.closest && t.closest("[data-st-play]");
    if (play) {
      var pop = root.querySelector('[data-st-pop="' + play.getAttribute("data-st-play") + '"]');
      if (!pop) return;
      e.preventDefault(); closeSheet(); shut(); openPop = pop; pop.hidden = false;
      var v = pop.querySelector("video"); if (v) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
      return;
    }
    var go = t.closest && t.closest("[data-st-go]");
    if (go) { e.preventDefault(); closeSheet(); goTo(document.getElementById(go.getAttribute("data-st-go"))); return; }
    var copy = t.closest && t.closest("[data-st-copy]");
    if (copy) {
      var words = copy.getAttribute("data-st-copy"), said = root.querySelector(".st-copied");
      function done() { if (said) { said.hidden = false; setTimeout(function () { said.hidden = true; }, 2600); } buzz(15); }
      try { navigator.clipboard.writeText(words).then(done, done); } catch (x) { done(); }
      return;
    }
    if (sheet && !sheet.hidden && (t === sheet || (t.closest && t.closest(".st-sheet-x")))) { closeSheet(); return; }
    if (openPop && (t === openPop || (t.closest && t.closest(".st-pop-x") && openPop.contains(t)))) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeSheet(); shut(); } });

  // A downward drag on the sheet's top edge closes it (a phone's habit).
  if (sheet) {
    var y0 = null, card = sheet.querySelector(".st-sheet-card");
    card.addEventListener("touchstart", function (e) { y0 = body.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    card.addEventListener("touchmove", function (e) { if (y0 !== null && e.touches[0].clientY - y0 > 90) { y0 = null; closeSheet(); } }, { passive: true });
  }
})();
