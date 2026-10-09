/* _shared/reel/v1/reel.js — the REEL's moves (references/REEL-PAGE-SOP.md), with reel.css. A reel block loads it
 * from its block.js: var s = document.createElement("script"); s.src = "/_p/_shared/reel/v1/reel.js"; ...
 *
 * The moves: which screen is on (it animates in, the dots follow), "Swipe" over the dots, the helper arrows until the
 * first flick, arrows and keys on a computer, and a flick past the last screen does what the button does.
 * A confirmation's pieces, each only when its markup is there:
 *   h1.rl-type          types itself out when the platform put the visitor's name in it (.pf-lead-name)
 *   .rl-who             the rep's picture, big, with a check (the platform's #pfn-data)
 *   .rl-gift-word       "Swipe ..." on a phone, "Scroll ..." on a computer (the word Swipe is swapped)
 *   .rl-cta[data-rep-cta="Message {first} for the companion guide"]   a computer's button with the rep in it
 *   [data-needs]        hidden when the value it names came through empty (an unfilled custom value), or sent to its
 *                       data-alt-href instead when it has one (the computer's button: no Messenger, the text page)
 */
(function () {
  var root = document.querySelector(".rl");
  if (!root || root.dataset.rlOn) return;
  root.dataset.rlOn = "1";
  var track = root.querySelector(".rl-track"), screens = [].slice.call(root.querySelectorAll(".rl-p"));
  var dots = root.querySelector(".rl-dots"), arrows = root.querySelector(".rl-arrows"), on = 0;
  var LIGHT = /\brl-(paper|tint)\b/, touch = window.matchMedia("(pointer: coarse)").matches;
  var D = {}; try { D = JSON.parse((document.getElementById("pfn-data") || {}).textContent || "{}"); } catch (e) {}
  var rep = D.rep || {};

  // [data-needs]: a button whose value didn't come through (no Messenger link yet) leaves the screen.
  [].forEach.call(root.querySelectorAll("[data-needs]"), function (el) {
    var v = String(el.getAttribute("data-needs") || "").trim();
    if (v && !/\{\{|^https?:\/\/$/.test(v)) return;
    if (el.hasAttribute("data-alt-href")) { el.setAttribute("href", el.getAttribute("data-alt-href")); return; }
    el.hidden = true; el.removeAttribute("data-pf-message-link");
  });

  // The word above the dots, turned on its side (Jeff, 2026-10-09). A phone swipes; a computer scrolls.
  if (dots) {
    var word = document.createElement("span");
    word.className = "rl-swipe"; word.setAttribute("aria-hidden", "true");
    word.textContent = touch ? "Swipe" : "Scroll";
    dots.appendChild(word);
    screens.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Screen " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
    });
  }
  function go(i) {
    i = Math.max(0, Math.min(screens.length - 1, i));
    track.scrollTo({ top: screens[i].offsetTop, behavior: "smooth" });
  }
  function opener() { return document.querySelector(".pfn-dock") || root.querySelector(".rl-cta"); }
  function mark(i) {
    on = i;
    screens.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    var ink = LIGHT.test(screens[i].className) ? "var(--ink)" : "#fff";
    if (dots) {
      [].forEach.call(dots.querySelectorAll("button"), function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      dots.style.setProperty("--dot", ink);
    }
    if (arrows) arrows.style.setProperty("--dot", ink);
    root.classList.toggle("rl-last", i === screens.length - 1);
    var d = document.querySelector(".pfn-dock");
    if (d) d.classList.toggle("rl-pulse", i === screens.length - 1);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) mark(screens.indexOf(e.target)); });
  }, { root: track, threshold: 0.6 });
  screens.forEach(function (s) { io.observe(s); });
  mark(0);
  // The dock is drawn by the platform after this runs; pulse it once it exists if we are already on the last screen.
  setTimeout(function () { mark(on); }, 400);

  track.addEventListener("scroll", function () { if (track.scrollTop > 24) root.classList.add("rl-moved"); }, { passive: true });

  root.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-go]");
    if (b) go(on + Number(b.getAttribute("data-go")));
  });
  document.addEventListener("keydown", function (e) {
    if (document.querySelector(".pf-ov[data-open]") || /^(INPUT|SELECT|TEXTAREA)$/.test((e.target || {}).tagName)) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(on + 1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(on - 1); }
  });

  // A flick up past the last screen does what the button does.
  var y0 = null;
  track.addEventListener("touchstart", function (e) { y0 = on === screens.length - 1 ? e.touches[0].clientY : null; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (y0 == null) return;
    var dy = (e.changedTouches[0] || {}).clientY - y0; y0 = null;
    // The dock's own swipe (funnel-native.js pfnSwipe): the form's sheet, or the card whose button is TAPPED, because an
    // iPhone opens Messenger's app only for a link the finger lifts on (2026-10-09).
    if (dy < -70 && track.scrollTop + track.clientHeight >= track.scrollHeight - 4) { var o = opener(); if (o) (o.pfnSwipe || o.click).call(o); }
  });

  // A sideways row of cards (.rl-cards) keeps its "1 of 6" (.rl-cards-cue, the next element) in step with the card in view.
  [].forEach.call(root.querySelectorAll(".rl-cards"), function (row) {
    var cue = row.nextElementSibling, n = row.children.length;
    if (!cue || !cue.classList.contains("rl-cards-cue") || !cue.firstChild || cue.firstChild.nodeType !== 3) return;
    row.addEventListener("scroll", function () {
      var w = row.children[0].getBoundingClientRect().width + 12, k = Math.min(n, Math.round(row.scrollLeft / w) + 1);
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) k = n;
      cue.firstChild.nodeValue = k + " of " + n;
    }, { passive: true });
  });

  /* ---------- a confirmation's pieces ---------- */
  var gift = root.querySelector(".rl-gift-word");
  if (gift && !touch) gift.textContent = gift.textContent.replace(/^Swipe/, "Scroll");

  var who = root.querySelector(".rl-who");
  if (who && rep.pic) {
    who.querySelector(".rl-who-pic").innerHTML = rep.pic;   // made on the server (rep-avatar.mjs pictureHtml), escaped there
    who.hidden = false;
  }
  var cta = root.querySelector(".rl-cta[data-rep-cta]");
  if (cta && rep.first) {
    var label = document.createElement("span");
    label.textContent = cta.getAttribute("data-rep-cta").replace("{first}", rep.first);
    cta.textContent = "";
    if (rep.pic) cta.insertAdjacentHTML("afterbegin", '<span class="rl-cta-pic" aria-hidden="true"><span>' + rep.pic +
      '</span><span class="rl-who-check"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></span>');
    cta.appendChild(label);
    cta.classList.add("rl-cta-rep");
  }

  var h = root.querySelector("h1.rl-type");
  if (h && h.querySelector(".pf-lead-name") && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    // Every letter in place from the start and revealed in turn, so nothing below moves.
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
    }, 450);   // after the page has risen out of the colour the form left on screen
  }
})();
