/* companion-web.js — the nav progress bar, and nothing else.
 *
 * The crash guide's script also drives a hero curve that flattens as you scroll. This page has
 * no curve: its argument is a graded list, not a shape, and animating something here would be
 * motion for its own sake. Kept separate rather than shared so neither page carries dead code.
 */
(function () {
  var root = document.querySelector(".sk-ew-comp");
  if (!root) return;
  var bar = root.querySelector(".ewnav-bar i");
  if (!bar) return;
  var tick = function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
  };
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  tick();
})();
