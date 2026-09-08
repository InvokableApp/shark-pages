/* nueva/n-kids-hydration-check/n-hydration-calculator
   Loader stub. A hosted block is NOT an ES module, so a bare `import` is a syntax error at load
   and the page ships with no behaviour at all (NEW-SYSTEM-SOP, caught on the Beneve Skin
   Diagnostic). Pull the shared engine in by absolute Pages URL instead.
   The version is PINNED: _shared files are fetched at request time by every shipped page in
   every system and every buyer account, so an unversioned import would make "fix this page" and
   "change every other system's page" the same action (_shared/README.md). */
(function () {
  var BASE = "https://invokableapp.github.io/shark-pages/_shared/calculator/v1/";
  if (!document.querySelector('link[data-sk="calc-v1"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.href = BASE + "calc.css"; l.setAttribute("data-sk", "calc-v1");
    document.head.appendChild(l);
  }
  if (!document.querySelector('script[data-sk="calc-v1"]')) {
    var s = document.createElement("script");
    s.src = BASE + "calc.js"; s.defer = true; s.setAttribute("data-sk", "calc-v1");
    document.head.appendChild(s);
  }
})();
