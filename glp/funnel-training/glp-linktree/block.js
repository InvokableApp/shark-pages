/* GLP / funnel-training / glp-links
 *
 * Loads the shared engine and nothing else. Every funnel training page ships
 * this exact file, so a fix there reaches every page on one push. The reveal
 * engine is folded into funnel-training.js rather than loaded separately.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/funnel-training/v1/funnel-training.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
