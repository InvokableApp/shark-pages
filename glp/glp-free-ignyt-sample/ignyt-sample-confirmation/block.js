/* glp / glp-free-ignyt-sample / ignyt-sample-confirmation
 *
 * Loads the shared product-page engine only for its scroll reveals. This page has no
 * popup to open, no countdown and no stat counters, so there is nothing else to bind.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/v1/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
