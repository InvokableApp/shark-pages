/* mpg/m-swipe-book/m-one-more: the swipe book's own moves, on top of reel.js (which marks the screen in view .is-on).
 *   - the rep's name and picture (the banner, "tell me", "let them know"), from the platform's #pfn-data
 *   - [data-mask] headlines: each word slides up out of its own mask, one after another (the words stay one text for a
 *     screen reader: the heading keeps an aria-label of its own text)
 *   - screen 5's count runs up to its number, and its 90 dots are drawn (one per country)
 *   - "Watch the story" opens the mission video in a pop-up (watch.js builds the player and reports the watching)
 *   - "Watch the story" opens the mission video in a pop-up (watch.js builds the player and reports the watching)
 *   - screen 4: press and hold to fill the glass; screen 5: +1 on the map, with the count from /_tally; screen 6: what
 *     matters most, one tap (each reported to the rep through watch.js)
 *   - the last screen's cards open the thank-you pop-up (watch.js tells the rep which card was tapped) */
(function () {
  var root = document.querySelector(".sb");
  if (!root) return;
  var d = {}; try { d = JSON.parse(document.getElementById("pfn-data").textContent); } catch (e) {}
  var first = d.rep && d.rep.first;
  if (first) [].forEach.call(root.querySelectorAll("[data-sb-rep]"), function (s) { s.textContent = first; });
  var banner = root.querySelector(".sb-banner");
  if (banner && first) {
    if (d.rep.pic) banner.querySelector(".sb-banner-pic").innerHTML = d.rep.pic; else banner.querySelector(".sb-banner-pic").remove();
    banner.hidden = false; root.classList.add("sb-has-banner");
  }

  // Masked words. Text nodes are split; an <em> (or any element) keeps its tag and its words are split inside it.
  var i = 0;
  function split(node) {
    [].slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 1) { if (!n.hasAttribute("data-if-name")) split(n); return; }
      if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
        var m = document.createElement("span"), s = document.createElement("span");
        m.className = "sb-w"; m.setAttribute("aria-hidden", "true"); s.textContent = w; s.style.setProperty("--i", i++);
        m.appendChild(s); frag.appendChild(m);
      });
      node.replaceChild(frag, n);
    });
  }
  [].forEach.call(root.querySelectorAll("[data-mask]"), function (h) {
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    i = 0; split(h); h.classList.add("sb-masked");
  });

  // 90 dots inside a circle, a loose globe (one per country, said in the words; the dots are decoration).
  var world = root.querySelector(".sb-world");
  if (world) {
    var NS = "http://www.w3.org/2000/svg", n = 0, k = 0, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var y = 18; y < 300 && n < 140; y += 22) for (var x = 18; x < 300; x += 22) {
      var dx = x - 150 + (y / 22 % 2 ? 11 : 0), dy = y - 150;
      if (dx * dx + dy * dy > 128 * 128) continue;
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", 150 + dx); c.setAttribute("cy", y); c.setAttribute("r", 3.2);
      var lit = rnd() < 0.66 && k < 90;
      if (lit) { k++; c.setAttribute("class", "sb-lit"); c.style.setProperty("--t", (rnd() * 2.6 + .4).toFixed(2) + "s"); }
      world.appendChild(c); n++;
    }
  }

  // The count: runs up each time its screen comes on.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  [].forEach.call(root.querySelectorAll("[data-count]"), function (el) {
    var to = Number(el.getAttribute("data-count")), screen = el.closest(".rl-p"), raf = 0;
    function show(v) { el.textContent = Math.round(v).toLocaleString("en-US"); }
    if (reduce) return show(to);
    new MutationObserver(function () {
      cancelAnimationFrame(raf);
      if (!screen.classList.contains("is-on")) { show(0); return; }
      var t0 = performance.now() + 350, len = 2200;
      (function step(t) {
        var p = Math.max(0, Math.min(1, (t - t0) / len));
        show(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) raf = requestAnimationFrame(step);
      })(t0);
    }).observe(screen, { attributes: true, attributeFilter: ["class"] });
  });

  // The mission video's pop-up: opens and plays on "Watch the story", stops when closed (tap the shade, the x, or Escape).
  var pop = root.querySelector("[data-sb-pop]");
  function vid() { return pop && pop.querySelector("video"); }
  function shut() { if (!pop || pop.hidden) return; pop.hidden = true; var v = vid(); if (v) v.pause(); }
  root.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-sb-play]")) {
      if (!pop) return;
      pop.hidden = false; var v = vid(); if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      return;
    }
    if (pop && !pop.hidden && (e.target === pop || (e.target.closest && e.target.closest("[data-sb-x]")))) shut();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") shut(); });

  // Hapt: a short buzz where the phone allows it (Android; an iPhone ignores it).
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  // SCREEN 4, FILL THE GLASS: press and hold (finger, mouse, or Space/Enter) and the bag pours; let go and it stops where it
  // is. Full: the heart pops, the line under it changes, and the hidden "Filled the cup" button is clicked so watch.js
  // tells the rep. About two seconds of holding fills it. Empty = the milk sits under the glass (y 160), full = y 64.
  var pour = root.querySelector("[data-sb-pour]");
  if (pour) {
    var fill = pour.querySelector(".sb-fill"), level = 0, holding = false, last = 0, full = false, tick = 0;
    var hint = pour.querySelectorAll(".sb-pour-hint b");
    function draw() { fill.setAttribute("transform", "translate(0 " + (160 - 96 * level).toFixed(1) + ")"); }
    draw();
    function frame(t) {
      if (!holding || full) return;
      level = Math.min(1, level + (t - (last || t)) / 2000); last = t; draw();
      if (t - tick > 160) { tick = t; buzz(8); }
      if (level >= 1) { done(); return; }
      requestAnimationFrame(frame);
    }
    function start(e) {
      if (full) return;
      if (e && e.cancelable && e.type !== "keydown") e.preventDefault();
      holding = true; last = 0; pour.classList.add("sb-pouring"); requestAnimationFrame(frame);
    }
    function stop() { holding = false; pour.classList.remove("sb-pouring"); }
    function done() {
      full = true; stop(); pour.classList.add("sb-full"); buzz([30, 40, 60]);
      if (hint.length > 1) { hint[0].hidden = true; hint[1].hidden = false; }
      var tell = pour.querySelector(".sb-tell"); if (tell) tell.click();
    }
    pour.addEventListener("pointerdown", function (e) { try { pour.setPointerCapture(e.pointerId); } catch (x) {} start(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) { pour.addEventListener(ev, stop); });
    pour.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    pour.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !holding) { e.preventDefault(); start(e); } });
    pour.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") stop(); });
  }

  // SCREEN 5, +1 ON THE MAP: a new dot flies onto the globe and lights, and the words say how many have added theirs
  // (the platform's /_tally counts everyone who tapped it on any of this system's links; watch.js reports this tap).
  var add = root.querySelector("[data-sb-add]");
  if (add) {
    var others = null, slug = location.pathname.replace(/\/+$/, "") || "/";
    fetch("/_tally?slug=" + encodeURIComponent(slug) + "&label=" + encodeURIComponent(add.getAttribute("data-label")))
      .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.n >= 0) others = j.n; }).catch(function () {});
    add.addEventListener("click", function () {
      if (add.disabled) return;
      add.disabled = true; add.classList.add("sb-added"); buzz(25);
      var world = root.querySelector(".sb-world");
      if (world) {
        var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", 145); c.setAttribute("cy", 52); c.setAttribute("r", 7); c.setAttribute("class", "sb-mine");
        world.appendChild(c);
      }
      var words = root.querySelector(".sb-add-words");
      if (words) {
        words.textContent = others >= 10 ? "You and " + others.toLocaleString("en-US") + " others have added one more." : "You're one of the first to add one more.";
        words.hidden = false;
      }
    });
  }

  // SCREEN 6, WHAT MATTERS MOST: one tap picks (the rep is told by watch.js), the others step back, and it moves on.
  [].forEach.call(root.querySelectorAll("[data-sb-pick]"), function (b) {
    b.addEventListener("click", function () {
      var all = root.querySelectorAll("[data-sb-pick]");
      [].forEach.call(all, function (o) { o.classList.toggle("sb-picked", o === b); o.classList.toggle("sb-unpicked", o !== b); });
      buzz(20);
      setTimeout(function () {
        var next = b.closest(".rl-p").nextElementSibling, track = root.querySelector(".rl-track");
        if (next && track) track.scrollTo({ top: next.offsetTop, behavior: "smooth" });
      }, 900);
    });
  });

  // THE LAST SCREEN'S CARDS: each opens the thank-you pop-up, showing only what fits that card. "We've sent your response"
  // only for someone who came by the rep's personal link (watch.js data-known="1": only then is the tap reported); anyone
  // else gets the text button first. A button whose value was empty (no join page) was already hidden by reel.js.
  var thx = root.querySelector("[data-sb-thx]");
  function fits(el, k) { var f = el.getAttribute("data-for"); return !f || f.split(" ").indexOf(k) > -1; }
  root.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest("[data-sb-card]");
    if (card && thx) {
      var k = card.getAttribute("data-sb-card"), w = document.querySelector('script[src*="watch.js"]');
      var known = !!(w && w.getAttribute("data-known") === "1");
      [].forEach.call(thx.querySelectorAll("[data-sb-known]"), function (p) { p.hidden = !fits(p, k) || (!known && !p.hasAttribute("data-any")); });
      var un = thx.querySelector("[data-sb-unknown]"); if (un) un.hidden = known || k === "no";
      [].forEach.call(thx.querySelectorAll(".sb-thx-btns a"), function (a) { a.classList.toggle("sb-off", !fits(a, k)); });
      // Not known: the text button leads, filled in.
      [].forEach.call(thx.querySelectorAll("[data-sb-text]"), function (a) { a.classList.toggle("rl-btn-2", known); });
      thx.classList.toggle("sb-unknown", !known);
      thx.hidden = false; buzz(20);
      return;
    }
    if (thx && !thx.hidden && (e.target === thx || (e.target.closest && e.target.closest("[data-sb-x]")))) thx.hidden = true;
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && thx) thx.hidden = true; });
})();
