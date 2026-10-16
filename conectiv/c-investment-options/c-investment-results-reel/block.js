/* conectiv/c-investment-options/c-investment-results-reel/block.js: the results show the visitor's own answers.
 * The quiz reel keeps them in this browser (sessionStorage "c-invest", under the survey's field names). The six tiles
 * take them under the page's labels. The twelve categories: ONE best fit, scored on every answer the quiz asks (risk,
 * hours a week, how soon, the monthly amount, experience, the goal), shown on its own; the other eleven, nearest first,
 * open under "See how the other approaches compare" (Jeff, 2026-10-16). No answers (the page opened on its own): the
 * tiles stay hidden and the row shows all twelve in the page's order. */
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
  // The answers, as numbers on the cards' own scales (data-risk 1 to 4, data-time 0 to 4).
  var RISK = { "Very Conservative": 1, "Somewhat Conservative": 1.5, "Moderate": 2, "Aggressive": 3, "Very Aggressive": 4 };
  var TIME = { "Less than 1 hour": 0, "1–3 hours": 1, "3–5 hours": 2, "5–10 hours": 3, "10+ hours": 4 };
  var SOON = { "Long-term (10+ years)": 4, "5–10 years": 3, "3–5 years": 2, "1–3 years": 1, "As quickly as reasonably possible": 1 };
  var CAP = { "Under $100/month": 0, "$100–$500/month": 1, "$500–$1,500/month": 2, "$1,500–$5,000/month": 3, "$5,000+/month": 4 };
  var EXP = { "Never": 0, "A little": 1, "Some experience": 2, "Experienced": 3, "Very experienced": 4 };
  // Each category's horizon (the card's own, as 1 short to 4 long), the capital and the experience it usually asks for,
  // and the goals it serves (the quiz's goal answers).
  var CAT = {
    "Cryptocurrency": [2, 1, 1, []],
    "Options Trading": [1.5, 2, 3, []],
    "Stock Market Investing": [3, 1, 1.5, ["Build long-term wealth"]],
    "Forex Trading": [1, 2, 3, []],
    "Real Estate Investing": [4, 4, 2, ["Generate passive income", "Protect against inflation"]],
    "Dividend Investing": [4, 2, 1, ["Generate passive income", "Retire earlier"]],
    "Starting or Buying a Business": [4, 4, 2, []],
    "Investing in Your Own Skills/Education": [3, 0, 0, ["Learn a high-income skill"]],
    "REITs": [3, 1, 1, ["Generate passive income", "Diversify my investments"]],
    "Precious Metals": [4, 1, 1, ["Protect against inflation", "Diversify my investments"]],
    "High-Yield Savings & Fixed Income": [1.5, 0, 0, []],
    "Index Funds & ETFs": [4, 0.5, 0, ["Build long-term wealth", "Diversify my investments", "Retire earlier"]]
  };
  var r = RISK[a.how_comfortable_are_you_with_investment_risk];
  var t = TIME[a.how_much_time_can_you_realistically_dedicate_each_week_some_strategies_are_more_handson_than_others];
  var h = SOON[a.how_soon_would_you_like_your_investments_to_begin_producing_meaningful_returns];
  var c = CAP[a.how_much_disposable_income_could_you_realistically_invest_each_month];
  var x = EXP[a.have_you_invested_before];
  var goal = a.what_is_your_primary_financial_goal;
  var row = document.querySelector(".cir-cats");
  if (!row || (r == null && t == null && h == null && c == null && x == null && !goal)) return;
  function far(card) {
    var k = CAT[card.querySelector("h3").textContent.trim()] || [2, 0, 0, []], d = 0;
    if (r != null) d += Math.abs(Number(card.getAttribute("data-risk")) - r);
    if (t != null) d += 0.6 * Math.abs(Number(card.getAttribute("data-time")) - t);
    if (h != null) d += 0.5 * Math.abs(k[0] - h);
    if (c != null) d += 0.7 * Math.max(0, k[1] - c);     // only a shortfall counts: more money never rules one out
    if (x != null) d += 0.5 * Math.max(0, k[2] - x);
    if (goal && k[3].indexOf(goal) > -1) d -= 1;
    return d;
  }
  var ranked = [].slice.call(row.children).map(function (el, i) { return { el: el, d: far(el), i: i }; })
    .sort(function (p, q) { return p.d - q.d || p.i - q.i; });
  ranked.forEach(function (p) { row.appendChild(p.el); });
  var best = document.querySelector(".cir-best"), more = document.querySelector(".cir-more");
  if (!best || !more) return;
  best.appendChild(ranked[0].el); best.hidden = false;
  try { sessionStorage.setItem("c-invest-best", ranked[0].el.querySelector("h3").textContent.trim()); } catch (e) {}   // the next step names it
  var label = document.querySelector("[data-best-label]");
  if (label) label.textContent = label.getAttribute("data-best-label");
  var cue = row.nextElementSibling && row.nextElementSibling.classList.contains("rl-cards-cue") ? row.nextElementSibling : null;
  if (cue && cue.firstChild && cue.firstChild.nodeType === 3) cue.firstChild.nodeValue = "1 of " + row.children.length;
  row.hidden = true; more.hidden = false; if (cue) cue.hidden = true;
  more.addEventListener("click", function () {
    var open = row.hidden; row.hidden = !open; if (cue) cue.hidden = !open;
    more.textContent = open ? "Hide the other approaches" : "See how the other approaches compare";
    if (open) row.scrollLeft = 0;
  });
})();
