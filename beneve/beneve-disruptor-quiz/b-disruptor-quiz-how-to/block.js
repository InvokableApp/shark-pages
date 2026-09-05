/* beneve / beneve-disruptor-quiz / b-disruptor-quiz-how-to
 *
 * Loads the shared howto engine and nothing else. Behaviour is shared, so a fix there
 * reaches every page of this type in every system on one git push.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/howto/v1/howto.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
