/* BENEVE / beneve-skin-diagnostic / beneve-skin-how-to
 *
 * ⚠️ THIS PAGE IS AN UNBUILT STUB. block.html is a wrapper around <!-- content -->
 * and the block is not installed on any account. It is left here as the scaffold
 * for the Skin Diagnostic how-to page, not as something that works.
 *
 * The loader below is the house pattern every other how-to page ships, corrected
 * 2026-08-31 from `import "../../../_shared/howto/howto.js"`, which was wrong twice:
 * that path does not exist (the component is versioned, _shared/howto/v1/), and a
 * bare ESM import does not run inside the non-module script tag a block gets.
 * Found by class-audit.mjs. → _shared/README.md, HOW-TO-FUNNEL-PAGE-SOP
 */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/";
  ["_shared/howto/v1/howto.js", "_shared/shark-reveal/v1/shark-reveal.js"].forEach(function (p) {
    if (document.querySelector('script[data-shark-shared="' + p + '"]')) return;
    var s = document.createElement("script");
    s.src = BASE + p;
    s.async = false;
    s.setAttribute("data-shark-shared", p);
    document.head.appendChild(s);
  });
})();
