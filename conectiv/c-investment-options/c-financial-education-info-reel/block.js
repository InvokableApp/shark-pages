/* conectiv/c-investment-options/c-financial-education-info-reel/block.js: the cover names the visitor's best fit, as the
 * results reel picked it (sessionStorage "c-invest-best"). None (the page opened on its own): the line stays hidden. */
(function () {
  var best = "";
  try { best = sessionStorage.getItem("c-invest-best") || ""; } catch (e) {}
  if (!best) return;
  [].forEach.call(document.querySelectorAll("[data-best]"), function (el) { el.textContent = best; });
  [].forEach.call(document.querySelectorAll("[data-if-best]"), function (el) { el.hidden = false; });
})();
