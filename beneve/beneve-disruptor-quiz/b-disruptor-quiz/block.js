/* beneve / beneve-disruptor-quiz / b-disruptor-quiz
 *
 * Loader stub. Behaviour lives in the shared component, so a fix there reaches every page of this
 * type in every system on one git push.
 *
 * ⚠️ THE PATH MUST MATCH THE COMPONENT THE MARKUP USES. This file was scaffolded pointing at
 * _shared/capture (root .sk-cap) / _shared/confirm while the markup is _shared/diagnostic-*
 * (roots .sk-dcap / .sk-dres). Both shared scripts open with a querySelector on their own root
 * and return silently when it is absent, so the page loaded, styled and animated nothing, and the
 * CTA did not open the popup. There is no error in the console: a stub pointing at the wrong
 * component is INDISTINGUISHABLE from one that works, until a button is clicked. Fixed 2026-09-05.
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/diagnostic-capture/v1/dcap.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
