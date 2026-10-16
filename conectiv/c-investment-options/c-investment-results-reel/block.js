/* conectiv/c-investment-options/c-investment-results-reel/block.js: the results show the visitor's own answers.
 * The quiz reel keeps them in this browser (sessionStorage "c-invest", under the survey's field names). The six tiles
 * take them under the page's labels; the twelve categories come closest to the visitor's risk and weekly-time answers
 * first (each card carries its own risk and time as numbers). No answers (the page opened on its own): the tiles stay
 * hidden and the categories keep the page's order. */
(function () {
  var a = {};
  try { a = JSON.parse(sessionStorage.getItem("c-invest") || "{}") || {}; } catch (e) {}
  var tiles = document.querySelector(".cir-tiles");
  if (tiles) {
    var any = false;
    [].forEach.call(tiles.querySelectorAll("[data-ans]"), function (t) {
      var v = a[t.getAttribute("data-ans")];
      if (v) { t.querySelector("dd").textContent = v; t.hidden = false; any = true; }
    });
    tiles.hidden = !any;
  }
  var RISK = { "Very Conservative": 1, "Somewhat Conservative": 1.5, "Moderate": 2, "Aggressive": 3, "Very Aggressive": 4 };
  var TIME = { "Less than 1 hour": 0, "1–3 hours": 1, "3–5 hours": 2, "5–10 hours": 3, "10+ hours": 4 };
  var r = RISK[a.how_comfortable_are_you_with_investment_risk];
  var t = TIME[a.how_much_time_can_you_realistically_dedicate_each_week_some_strategies_are_more_handson_than_others];
  var row = document.querySelector(".cir-cats");
  if (!row || (r == null && t == null)) return;
  var cards = [].slice.call(row.children);
  function far(c) {
    return (r == null ? 0 : Math.abs(Number(c.getAttribute("data-risk")) - r)) + (t == null ? 0 : 0.6 * Math.abs(Number(c.getAttribute("data-time")) - t));
  }
  cards.map(function (c, i) { return { c: c, d: far(c), i: i }; })
    .sort(function (x, y) { return x.d - y.d || x.i - y.i; })
    .forEach(function (x) { row.appendChild(x.c); });
  // the row snaps back to the card it rested on before the sort (now card 10 or so): open it on the best fit
  function home() { row.scrollLeft = 0; }
  home(); requestAnimationFrame(home); setTimeout(home, 400);
})();
