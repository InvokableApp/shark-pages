/* _shared/confirm/v1/confirm.js
 *
 * The ONE confirmation-page behaviour file, for every campaign in every system, scoped .sk-conf.
 * Same contract as _shared/howto/v1/howto.js: a page's block.js loads this and nothing else.
 *
 * It does three things.
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
 *   3. POPUP CTA. A CTA carrying `data-sk-open` opens the GHL page's own popup instead of
 *      navigating. Added 2026-09-02 for the Beneve Hormone Lunchbox split test, whose B page
 *      asks the reader to note the rep's name before joining the group, and that ask lives in
 *      the page popup rather than in this block so the rep's name comes from the account.
 *
 *      Same attribute and same mechanic as _shared/capture/v1: the no-argument window event
 *      GHL ships for custom widgets. It is the ONLY account-agnostic trigger channel, because
 *      it names no popup id, and ids are `hl_main_popup-<random>`, minted per page
 *      (HOSTED-BLOCKS-SOP §7). Constraint that rides along: ONE popup per page, since a
 *      no-id emit resolves to popupList[0].
 *
 *      ADDITIVE. Every .sk-conf page shipped before this date has zero [data-sk-open] nodes
 *      (checked across all four), so this binds nothing on them.
 *
 * ES5 only, no build step, no dependencies. GHL injects blocks with innerHTML, which does not
 * execute <script>, so the socket loader is what calls boot() (see HOSTED-BLOCKS-SOP).
 */
(function () {
  "use strict";

  function playVideo(frame) {
    if (frame.getAttribute("data-playing") === "true") return;

    /* A SELF-HOSTED file (data-video) plays in a native <video>, no third party involved.
       Added 2026-09-01: Beneve's confirmation video is an H.264/AAC file on GHL's own CDN,
       served as video/quicktime because it is named .mov. The `src` is set bare, with no
       <source type>, precisely so no browser gates playback on that wrong mime type. */
    var file = frame.getAttribute("data-video");
    if (file) {
      var v = document.createElement("video");
      v.src = file;
      v.controls = true;
      v.autoplay = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("preload", "none");
      v.setAttribute("title", frame.getAttribute("aria-label") || "Video");
      frame.setAttribute("data-playing", "true");
      frame.appendChild(v);
      return;
    }

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
    /* ── popup CTA ──────────────────────────────────────────────────────────────
       Delegated from the block root so a button added to the markup later needs no
       rebinding. preventDefault only fires for a real [data-sk-open] target, which
       leaves every other CTA on the component navigating as it always has.

       The anchor keeps its href on purpose: if this script never runs, the button is
       still a working link to the next step rather than dead markup. It skips the
       popup in that case, which is the mild failure, not the bad one. */
    if (!scope.getAttribute("data-sk-popup-wired")) {
      scope.setAttribute("data-sk-popup-wired", "1");
      scope.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest("[data-sk-open]") : null;
        if (!t || !scope.contains(t)) return;
        e.preventDefault();
        window.dispatchEvent(new Event("customWidgetOpenPopup"));
      });
    }

    var frames = scope.querySelectorAll("[data-vimeo],[data-video]");
    for (var i = 0; i < frames.length; i++) {
      (function (frame) {
        var id = (frame.getAttribute("data-vimeo") || frame.getAttribute("data-video") || "").trim();
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
