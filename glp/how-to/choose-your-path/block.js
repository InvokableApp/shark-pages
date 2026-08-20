/* GLP / how-to / choose-your-path
 *
 * Loads the two shared engines and nothing else. Every how-to page ships this
 * exact file: behaviour is shared, so a fix there reaches every page on one push.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/howto/howto.js", "_shared/shark-reveal.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
