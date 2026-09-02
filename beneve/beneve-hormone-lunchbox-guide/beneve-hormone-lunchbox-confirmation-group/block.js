/* beneve / beneve-hormone-lunchbox-guide / beneve-hormone-lunchbox-confirmation-group
 *
 * Loads the shared confirmation engine and nothing else, same stub as variant A.
 *
 * This page has no video, so the only behaviour it needs is the popup CTA: the JOIN OUR
 * PRIVATE GROUP button carries `data-sk-open`, and _shared/confirm/v1/confirm.js turns that
 * into the customWidgetOpenPopup window event.
 *
 * ⚠️ A block that gains an interactive element gains a block.js IN THE SAME EDIT. GHL injects
 * blocks with innerHTML, which does not execute <script>, so this stub is the only route the
 * engine has onto the page. Variant A shipped for a few minutes without one on 2026-09-01 and
 * its play button was inert markup.
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
