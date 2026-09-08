/* beneve / beneve-hormone-lunchbox-guide / beneve-hormone-lunchbox-sample
 *
 * Loads the shared confirmation engine and nothing else. The behaviour on this page is the
 * DM button: it copies "DISCOUNTED GLUTATHIONE SAMPLE" to the clipboard and then follows its
 * href to the redirect step, so the visitor arrives in Messenger with the message ready and
 * only has to paste and send.
 *
 * ⚠️ This file did not exist until 2026-09-08. The page had no interactive element before the
 * DM button, so nothing loaded confirm.js, and adding data-sk-copy to the markup alone would
 * have been inert: the anchor would simply navigate, silently copying nothing. GHL injects
 * blocks with innerHTML, which does not execute <script>, so this is the only route the engine
 * has onto the page. A block that gains an interactive element gains a block.js in the same
 * edit (HOSTED-BLOCKS-SOP).
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
