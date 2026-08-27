/* _shared/confirm/v1/confirm.js
 *
 * The ONE confirmation-page behaviour file, for every campaign in every system, scoped .sk-conf.
 * Same contract as _shared/howto/v1/howto.js: a page's block.js loads this and nothing else.
 *
 * It does exactly two things.
 *
 *   1. VIDEO FACADE. The markup ships a poster and a play button, never an iframe. The vimeo
 *      player is only injected on click, so a confirmation page carrying a video still loads
 *      like one that does not, and no third-party frame is created for a visitor who never
 *      presses play. The id lives in data-vimeo, so swapping the video is a one-token edit.
 *
 *   2. EMPTY-SLOT HIDING. If data-vimeo is empty the whole section is hidden. This is what lets
 *      the page ship BEFORE the video exists. The alternative, a "video coming soon" card, is
 *      worst on exactly this page: it is the one screen where you are asking someone to believe
 *      a stranger will put something in the post, and an unkept promise in the middle of it is
 *      the wrong first impression. Paste the id in later and the section appears by itself.
 *
 * ES5 only, no build step, no dependencies. GHL injects blocks with innerHTML, which does not
 * execute <script>, so the socket loader is what calls boot() (see HOSTED-BLOCKS-SOP).
 */
(function () {
  "use strict";

  function playVideo(frame) {
    if (frame.getAttribute("data-playing") === "true") return;
    var id = frame.getAttribute("data-vimeo");
    if (!id) return;
    var f = document.createElement("iframe");
    f.src = "https://player.vimeo.com/video/" + encodeURIComponent(id) +
            "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
    f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("title", frame.getAttribute("aria-label") || "Video");
    f.setAttribute("loading", "lazy");
    frame.setAttribute("data-playing", "true");
    frame.appendChild(f);
  }

  function wire(scope) {
    var frames = scope.querySelectorAll("[data-vimeo]");
    for (var i = 0; i < frames.length; i++) {
      (function (frame) {
        var id = (frame.getAttribute("data-vimeo") || "").trim();
        var section = frame.closest ? frame.closest(".sk-conf-video") : null;

        /* no id yet: hide the section and wire nothing */
        if (!id) {
          if (section) section.setAttribute("hidden", "hidden");
          return;
        }
        if (section) section.removeAttribute("hidden");

        /* the poster is a background-image so it never counts as a broken <img> in a headless
           check and never reflows the frame while it loads */
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
    var blocks = document.querySelectorAll(".sk-conf");
    for (var i = 0; i < blocks.length; i++) wire(blocks[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();

  window.skConfirmBoot = boot;
})();
