/* nueva/n-caffeine-curve/n-caffeine-curve
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

/* ── "Question 3 of 6" ──────────────────────────────────────────────────────────────────────
   ⚠️ BLOCK-LOCAL ON PURPOSE. The shared engine renders a 4px progress track and no count, and a
   hairline alone at the top of a large white card reads as a scratch rather than as progress.
   Adding the count to _shared/calculator/v1 would change every calculator in every system and
   every buyer account on its next load (_shared/README.md), for a nicety one page asked for. So
   it is derived HERE, from markup the engine already emits: the track carries role="progressbar"
   with aria-valuenow, which is the step index as a percentage. No fork, no shared-version bump.

   The engine replaces mount.innerHTML on every step, so this observes rather than runs once. */
(function () {
  var root = document.querySelector(".sk-calc-nva-teen");
  if (!root || !window.MutationObserver) return;
  var mount = root.querySelector(".sk-calc-mount");
  if (!mount) return;

  function total() {
    try {
      var cfg = JSON.parse(root.querySelector(".sk-calc-config").textContent);
      return (cfg.steps || []).length;
    } catch (e) { return 0; }
  }
  var N = total();

  function paint() {
    if (!N) return;
    var bar = mount.querySelector(".sk-calc-prog");
    // Only the QUESTION steps have a track. The calculating beat, the gate and the result do
    // not, so this simply does nothing on them, which is the wanted behaviour.
    if (!bar || mount.querySelector(".sk-calc-count")) return;
    var pct = parseFloat(bar.getAttribute("aria-valuenow") || "0");
    var n = Math.round((pct / 100) * N) + 1;
    if (n < 1 || n > N) return;
    var row = document.createElement("div");
    row.className = "sk-calc-count";
    row.innerHTML = "Question " + n + " of " + N + " <b>" + Math.round((n - 1) / N * 100) + "% done</b>";
    bar.parentNode.insertBefore(row, bar);
  }

  new MutationObserver(paint).observe(mount, { childList: true });
  paint();
})();
