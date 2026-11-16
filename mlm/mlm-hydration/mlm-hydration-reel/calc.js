/* mlm/mlm-hydration/mlm-hydration-reel/calc.js (Marketing Shark | MLM): THE ONE COPY of How Much Should You Drink
 * Today's arithmetic. The opt-in reel (quiz.js) and the result page (mlm-hydration-result/block.js) both load this file,
 * so the number on the result page and the number in the rep's alert and the lead's email can never drift apart.
 *
 * THE METHOD, and which numbers are ours (the result page prints it, "Where this number comes from"):
 *   - Baseline: about 35 ml of water a day per kg of body weight, a common adult maintenance figure in dietetics
 *     (the source funnel used Holliday-Segar, a children's method, so the adult version swaps it).
 *   - Less food: about 20 percent of the day's water comes in food, so drinks are 80 percent of it (28 ml per kg).
 *   - Plus sweat: about 0.5 liters an hour of hard effort, the low end of the 0.5 to 2 liters an hour commonly reported
 *     for exercise. OURS, picked low so the estimate leans conservative. Warm adds 15 percent, hot a third (OURS).
 *   - Salt: about 900 mg of sodium per liter of sweat, a commonly reported average; people vary a lot (OURS to argue with).
 *   - A bottle is 16 oz. A teaspoon of salt is about 2,300 mg of sodium.
 * It is arithmetic on the answers, an estimate, not medical advice and not an assessment of anyone. Change a number here
 * and the page's method text with it. */
(function () {
  var W = { w1: { kg: 54, label: "Under 130 lb" }, w2: { kg: 66, label: "130 to 160 lb" }, w3: { kg: 79, label: "160 to 190 lb" },
            w4: { kg: 93, label: "190 to 220 lb" }, w5: { kg: 107, label: "Over 220 lb" } };
  var S = { s0: { h: 0, label: "Hardly at all" }, s1: { h: 0.5, label: "About 30 minutes" }, s2: { h: 1, label: "About an hour" },
            s3: { h: 2, label: "About 2 hours" }, s4: { h: 3, label: "3 hours or more" } };
  var H = { h1: { x: 1, label: "Cool, or indoors" }, h2: { x: 1.15, label: "Warm" }, h3: { x: 1.33, label: "Hot, or I come out soaked" } };
  var D = { d1: { oz: 24, label: "2 bottles or less" }, d2: { oz: 56, label: "3 to 4 bottles" }, d3: { oz: 88, label: "5 to 6 bottles" },
            d4: { oz: 120, label: "7 bottles or more" } };
  var ML_PER_OZ = 29.5735, BOTTLE = 16, NA_PER_L = 900, NA_PER_TSP = 2300;

  function tsp(mg) {   // the nearest kitchen measure, in words
    var t = mg / NA_PER_TSP;
    var marks = [[0.125, "an eighth of a teaspoon"], [0.25, "a quarter teaspoon"], [0.33, "a third of a teaspoon"], [0.5, "half a teaspoon"],
                 [0.66, "two thirds of a teaspoon"], [0.75, "three quarters of a teaspoon"], [1, "a teaspoon"], [1.25, "a teaspoon and a quarter"],
                 [1.5, "a teaspoon and a half"], [2, "two teaspoons"]];
    var best = marks[0];
    marks.forEach(function (m) { if (Math.abs(m[0] - t) < Math.abs(best[0] - t)) best = m; });
    return best[1];
  }

  function calc(a) {
    var w = W[a.w], s = S[a.s], h = H[a.h], d = D[a.d];
    if (!w || !s || !h || !d) return null;
    var sweatL = s.h * 0.5 * h.x;
    var needMl = w.kg * 35 * 0.8 + sweatL * 1000;
    var need = Math.round(needMl / ML_PER_OZ), drink = d.oz, gap = Math.max(0, need - drink);
    var p = drink / need;
    var sodium = Math.round(sweatL * NA_PER_L / 10) * 10;
    return {
      need: need, needBottles: Math.round(need / BOTTLE * 2) / 2, drink: drink, gap: gap, gapBottles: Math.round(gap / BOTTLE * 2) / 2,
      pct: Math.round(p * 100), band: p >= 0.85 ? "close" : p >= 0.6 ? "short" : "well",
      sweatL: Math.round(sweatL * 10) / 10, sodium: sodium, salt: sodium ? tsp(sodium) : "",
      labels: { w: w.label, s: s.label, h: h.label, d: d.label }
    };
  }
  window.mlmHydration = { calc: calc, W: W, S: S, H: H, D: D };
})();
