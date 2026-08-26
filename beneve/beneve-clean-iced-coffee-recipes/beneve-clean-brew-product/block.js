/* beneve / beneve-clean-iced-coffee-recipes / beneve-clean-brew-product
 *
 * Loads the shared product-page engine and nothing else. Every product page ships this exact
 * file: behaviour is shared, so a fix there reaches every page on one push.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/product/product.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
