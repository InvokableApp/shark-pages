/* glp / glp-natural-foods-guide / glp-food-guide-confirmation
 *
 * Loads the shared confirmation engine and nothing else. This page carries no custom values,
 * so there is no merge-field guard to write: every string on it is literal.
 *
 * ⚠️ GHL injects blocks with innerHTML, which does not execute <script>, so appending the
 * shared engine from here is the only route it has onto the page. The engine is what turns
 * the video poster into a click-to-load Vimeo facade, and what hides the whole video band if
 * the id is ever emptied.
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
