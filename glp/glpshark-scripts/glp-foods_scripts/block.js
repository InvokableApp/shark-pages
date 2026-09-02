/* GLP / glpshark-scripts / glp-foods_scripts
 *
 * Loads the two shared engines and nothing else. Every scripts page ships this
 * exact file: behaviour is shared, so a fix there reaches every page on one push.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/scripts/v1/scripts.js", "_shared/shark-reveal/v1/shark-reveal.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
