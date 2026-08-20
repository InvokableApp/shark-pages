/* Vital / Minimalist GLP Guide / The Guide
   Highlights the jump-nav chip for whichever section is on screen, and remembers
   the shopping-list checkboxes so a reader can tick things off in the store and
   come back to the page without losing them. */
(function () {
  var root = document.querySelector(".sk-vital-vital-minimalist-glp-guide-guide[data-sk-guide]");
  if (!root || root.dataset.skWired) return;
  root.dataset.skWired = "1";

  var links = {};
  root.querySelectorAll(".g-nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var secs = root.querySelectorAll(".g-sec[id]");
  if (secs.length && window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("data-sk-here"); });
          a.setAttribute("data-sk-here", "1");
        }
      });
    }, { rootMargin: "-64px 0px -70% 0px", threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  }

  // Checkbox state, keyed by the item label so it survives a content rebuild that
  // reorders the list. localStorage may throw in private mode, so it is guarded.
  var KEY = "sk-vital-minimalist-glp-shop";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  root.querySelectorAll(".g-aisle label").forEach(function (l) {
    var box = l.querySelector("input");
    var name = (l.querySelector("span") || {}).textContent || "";
    if (!box || !name) return;
    if (saved[name]) box.checked = true;
    box.addEventListener("change", function () {
      saved[name] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
