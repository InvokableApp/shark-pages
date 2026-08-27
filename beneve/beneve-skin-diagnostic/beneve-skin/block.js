/* beneve / beneve-skin-diagnostic / beneve-skin
 *
 * Loads the shared capture engine and nothing else. Every capture page ships this exact file:
 * behaviour is shared, so a fix there reaches every page on one push.
 *
 * The engine is what turns every [data-sk-open] button on this page into the no-argument window
 * event GHL ships for opening a page popup. The survey lives in that popup, so there is no popup
 * id anywhere in this block and it survives a snapshot install unchanged.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/capture/v1/capture.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
