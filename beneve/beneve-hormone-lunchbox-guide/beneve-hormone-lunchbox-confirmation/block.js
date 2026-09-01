/* beneve / beneve-hormone-lunchbox-guide / beneve-hormone-lunchbox-confirmation
 *
 * Loads the shared confirmation engine and nothing else. The behaviour on this page is the
 * click-to-load video facade, and it lives in _shared/confirm/v1/confirm.js so every
 * confirmation page in every system gets the same fixes.
 *
 * ⚠️ This file did not exist until 2026-09-01 and the page shipped without it for a few
 * minutes: the page had no behaviour at all before the video went in, so nothing loaded
 * confirm.js, and the play button was inert markup. A block that gains an interactive
 * element gains a block.js in the same edit. GHL injects blocks with innerHTML, which does
 * not execute <script>, so this is the only route the engine has onto the page.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/confirm/v1/confirm.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
