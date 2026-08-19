/* howto.js — shared behaviour for every "how to use this funnel" page.
 *
 * Loaded from each block's block.js. Two jobs, nothing else:
 *
 *   1. VIDEO FACADE. Markup ships a poster + a play button, never an iframe. The
 *      vimeo player is only injected on click, so a page carrying three videos
 *      costs nothing until a rep asks for one. The vimeo id lives in a data
 *      attribute, so swapping a video for a new funnel is a one-token edit.
 *
 *   2. ICONS. Inline SVG path data from one map, per design system 4: never an
 *      icon font, never a remote sprite. An element writes data-sk-icon="play"
 *      and gets the stroke icon at whatever size its container sets.
 *
 * The scroll-reveal engine is shared separately (_shared/shark-reveal.js) and is
 * pulled in by each block.js alongside this file.
 */
(function () {
  if (window.__sharkHowto) return;
  window.__sharkHowto = true;

  var NS = "http://www.w3.org/2000/svg";

  /* 24x24 viewBox, fill none, stroke currentColor. Keep new entries in this shape. */
  var I = {
    play:   "M7 4.5v15l13-7.5z",
    funnel: "M3 4h18l-7 8v7l-4 2v-9z",
    info:   "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 7.6v.4",
    eye:    "M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6z",
    chat:   "M20.5 12.4c0 4-3.8 7.2-8.5 7.2a10 10 0 01-2.6-.34L4 21l1.2-3.4A6.9 6.9 0 013.5 12.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z",
    image:  "M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 3-3L20 16M9 9.5a1 1 0 100-2 1 1 0 000 2z",
    school: "M12 4l9 4.5-9 4.5-9-4.5zM7 11v4.6c0 1.4 2.2 2.4 5 2.4s5-1 5-2.4V11",
    book:   "M4.5 5.2A1.7 1.7 0 016.2 3.5H19v13.2H6.2a1.7 1.7 0 00-1.7 1.7zM4.5 18.4a1.7 1.7 0 001.7 1.7H19v-3.4M8.2 7.6h6.6M8.2 11h4.4",
    mega:   "M4 10.2v3.6a1 1 0 001 1h2.2l7.3 3.9V5.3L7.2 9.2H5a1 1 0 00-1 1zM18.4 9.4a3.6 3.6 0 010 5.2M7.2 15.2V19a1 1 0 001 1h1.4a1 1 0 001-1v-2.2",
    target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 13.2a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z",
    arrow:  "M5 12h14M13 6l6 6-6 6",
    ext:    "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"
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
    var blocks = document.querySelectorAll(".sk-howto");
    for (var i = 0; i < blocks.length; i++) wire(blocks[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
