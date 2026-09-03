/* scripts.js: shared behaviour for every "funnel scripts" page.
 *
 * Loaded from each block's block.js. Four jobs, nothing else:
 *
 *   1. COPY. The reason the page exists. A rep taps Copy and pastes the script
 *      into their messages app, so what lands on the clipboard has to be what
 *      they would have typed: plain text, blank line between paragraphs, the
 *      bracketed slots intact, and any link as a bare URL rather than as link
 *      text. Never innerHTML, never a trailing "Copy script" label.
 *
 *   2. VIDEO FACADE. Markup ships a poster and a play button, never an iframe.
 *      The vimeo player is only injected on click. Design system 4.
 *
 *   3. PRINT. Reps keep this sheet by the phone. The button just calls print();
 *      the whole deliverable is the @media print block in scripts.css.
 *
 *   4. ICONS. Inline SVG path data from one map, per design system 4: never an
 *      icon font, never a remote sprite.
 *
 * The scroll-reveal engine is shared separately (_shared/shark-reveal/v1/shark-reveal.js)
 * and is pulled in by each block.js alongside this file.
 */
(function () {
  if (window.__sharkScripts) return;
  window.__sharkScripts = true;

  var NS = "http://www.w3.org/2000/svg";

  /* 24x24 viewBox, fill none, stroke currentColor. Keep new entries in this shape. */
  var I = {
    play:    "M7 4.5v15l13-7.5z",
    funnel:  "M3 4h18l-7 8v7l-4 2v-9z",
    copy:    "M9 9V5.5A1.5 1.5 0 0110.5 4h8A1.5 1.5 0 0120 5.5v8a1.5 1.5 0 01-1.5 1.5H15M5.5 9h8A1.5 1.5 0 0115 10.5v8a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 014 18.5v-8A1.5 1.5 0 015.5 9z",
    check:   "M4.5 12.5l5 5 10-11",
    printer: "M7 8.5V4h10v4.5M7 17.5H5.5A1.5 1.5 0 014 16v-5a1.5 1.5 0 011.5-1.5h13A1.5 1.5 0 0120 11v5a1.5 1.5 0 01-1.5 1.5H17M7 14h10v6H7z",
    bulb:    "M9.5 17.5h5M10 20.5h4M12 3.5a5.5 5.5 0 00-3.2 9.97c.5.36.8.94.8 1.56v.47h4.8v-.47c0-.62.3-1.2.8-1.56A5.5 5.5 0 0012 3.5z",
    eye:     "M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6z"
  };

  function icon(name) {
    var d = I[name];
    if (!d) return null;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    /* the play triangle reads as a solid mark, not an outline */
    if (name === "play") { p.setAttribute("fill", "currentColor"); svg.setAttribute("stroke-width", "1"); }
    svg.appendChild(p);
    return svg;
  }

  function paintIcons(scope) {
    var els = scope.querySelectorAll("[data-sk-icon]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.firstElementChild) continue;
      var svg = icon(el.getAttribute("data-sk-icon"));
      if (svg) el.appendChild(svg);
    }
  }

  /* Paragraph to plain text.
     innerText alone is nearly right and wrong in one place that matters: a link
     whose visible text is not its URL would paste as words with the address
     dropped, and the address IS the thing the lead needs. So an anchor gives up
     its href whenever the two differ. */
  function paraText(p) {
    var out = "";
    var walk = function (node) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var n = node.childNodes[i];
        if (n.nodeType === 3) { out += n.nodeValue; continue; }
        if (n.nodeType !== 1) continue;
        if (n.tagName === "BR") { out += "\n"; continue; }
        if (n.tagName === "A") {
          var txt = (n.textContent || "").trim();
          var href = n.getAttribute("href") || "";
          out += (txt && href && txt.replace(/\/$/, "") !== href.replace(/\/$/, "")) ? txt + " " + href : (txt || href);
          continue;
        }
        walk(n);
      }
    };
    walk(p);
    return out.replace(/[ \t]+/g, " ").trim();
  }

  function scriptText(box) {
    var ps = box.querySelectorAll("p");
    var parts = [];
    for (var i = 0; i < ps.length; i++) {
      var t = paraText(ps[i]);
      if (t) parts.push(t);
    }
    /* blank line between paragraphs: this is how it reads in a messages app */
    return parts.join("\n\n");
  }

  /* Label swaps to a confirmation for 1.9s, then restores, so the rep gets
     feedback without a toast or a layout shift. execCommand is the fallback:
     the clipboard API needs a secure context, and a GHL page on a not-yet-SSL
     domain is exactly where this would otherwise fail silently. */
  function copyText(text, btn) {
    var label = btn.querySelector("[data-copy-label]") || btn;
    var was = label.textContent;
    var done = function () {
      btn.setAttribute("data-done", "true");
      label.textContent = btn.getAttribute("data-copy-done") || "Copied";
      setTimeout(function () { btn.removeAttribute("data-done"); label.textContent = was; }, 1900);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(text, done); });
    } else legacy(text, done);
  }

  function legacy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* nothing else to try */ }
    document.body.removeChild(ta);
  }

  function playVideo(frame) {
    if (frame.getAttribute("data-playing") === "true") return;
    var id = frame.getAttribute("data-vimeo");
    if (!id) return;
    var f = document.createElement("iframe");
    f.src = "https://player.vimeo.com/video/" + encodeURIComponent(id) +
            "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
    f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("title", frame.getAttribute("aria-label") || "Training video");
    f.setAttribute("loading", "lazy");
    frame.setAttribute("data-playing", "true");
    frame.appendChild(f);
  }

  function wire(scope) {
    paintIcons(scope);

    var copiers = scope.querySelectorAll("[data-sk-copy]");
    for (var c = 0; c < copiers.length; c++) {
      (function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          var step = btn.closest(".sk-step") || scope;
          var src = step.querySelector(".sk-script");
          if (src) copyText(scriptText(src), btn);
        });
      })(copiers[c]);
    }

    var printers = scope.querySelectorAll("[data-sk-print]");
    for (var p = 0; p < printers.length; p++) {
      printers[p].addEventListener("click", function (e) { e.preventDefault(); window.print(); });
    }

    var frames = scope.querySelectorAll("[data-vimeo]");
    for (var i = 0; i < frames.length; i++) {
      (function (frame) {
        /* the poster is a background-image so it never counts as a broken <img>
           in a headless check and never reflows the card while loading */
        var poster = frame.getAttribute("data-poster");
        if (poster) frame.style.backgroundImage = "url('" + poster + "')";
        frame.addEventListener("click", function () { playVideo(frame); });
        frame.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playVideo(frame); }
        });
      })(frames[i]);
    }
  }

  function boot() {
    var blocks = document.querySelectorAll(".sk-scripts");
    for (var i = 0; i < blocks.length; i++) wire(blocks[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

/* ---- TRACKS (added 2026-09-03) -------------------------------------------
   Pages whose config declares `tracks` render one .sk-group per track plus the
   shared block. This shows one track at a time.

   The root only gets .sk-has-tracks once this runs, so the CSS that hides a
   track cannot apply before the script does. With JS off, or if this file fails
   to load, every track stays visible: a longer page, never an empty one.

   Nothing here runs on a page without track buttons, which is all 18 others. */
(function () {
  var root = document.querySelector(".sk-scripts");
  if (!root) return;
  var btns = root.querySelectorAll("[data-sk-track]");
  if (!btns.length) return;

  root.classList.add("sk-has-tracks");

  function show(key) {
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", String(btns[i].getAttribute("data-sk-track") === key));
    }
    var groups = root.querySelectorAll(".sk-group[data-track]");
    for (var j = 0; j < groups.length; j++) {
      var on = groups[j].getAttribute("data-track") === key;
      groups[j].classList.toggle("sk-on", on);
      // ⚠️ A HIDDEN CARD NEVER INTERSECTS, so the reveal observer never fires for it and it
      // is still at opacity 0 when its track is switched on. Measured on the live page:
      // 4 cards stuck invisible, and switching to that track showed an EMPTY group, which
      // reads as a broken page rather than a missing animation. Reveal on reveal.
      if (on) {
        var cards = groups[j].querySelectorAll("[data-sk-reveal]");
        for (var c = 0; c < cards.length; c++) cards[c].classList.add("sk-in");
      }
    }
  }

  for (var k = 0; k < btns.length; k++) {
    btns[k].addEventListener("click", function () { show(this.getAttribute("data-sk-track")); });
  }
  show(btns[0].getAttribute("data-sk-track"));
})();
