/* conectiv / c-free-coffee-sample / c-free-coffee-sample-confirmation
 *
 * Loads the shared confirmation engine and nothing else. All the behaviour on this page (the
 * click-to-load vimeo facade, and hiding the video section while no id is set) lives in
 * _shared/confirm/confirm.js so every confirmation page in every system gets the same fixes.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/confirm/confirm.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
